import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';

interface OrderItem {
  date: string;
  productName: string;
  quantity: number;
  totalAmount: number;
}

interface GroupedOrder {
  orderCode: string;
  date: string;
  items: OrderItem[];
  totalQuantity: number;
  totalAmount: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check expiry
    const expiryDate = (session.user as any).expiryDate;
    if (!expiryDate || new Date(expiryDate) < new Date()) {
      return NextResponse.json(
        { error: 'Subscription expired' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read the Excel file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json(
        { error: 'No worksheet found' },
        { status: 400 }
      );
    }

    // Find column indices
    const headerRow = worksheet.getRow(1);
    let orderCodeColIndex = -1;
    let dateColIndex = -1;
    let productColIndex = -1;
    let quantityColIndex = -1;
    let amountColIndex = -1;

    headerRow.eachCell((cell, colNumber) => {
      const cellValue = cell?.value?.toString()?.toLowerCase()?.trim() ?? '';
      if (cellValue.includes('mã') && cellValue.includes('đơn')) {
        orderCodeColIndex = colNumber;
      } else if (cellValue.includes('date') || cellValue.includes('ngày')) {
        dateColIndex = colNumber;
      } else if (
        cellValue.includes('hanghoa') ||
        cellValue.includes('hàng hóa') ||
        cellValue.includes('sản phẩm')
      ) {
        productColIndex = colNumber;
      } else if (cellValue === 'sl' || cellValue.includes('số lượng')) {
        quantityColIndex = colNumber;
      } else if (
        cellValue.includes('tiền về túi') ||
        cellValue.includes('tiền')
      ) {
        amountColIndex = colNumber;
      }
    });

    if (
      orderCodeColIndex === -1 ||
      dateColIndex === -1 ||
      productColIndex === -1 ||
      quantityColIndex === -1 ||
      amountColIndex === -1
    ) {
      return NextResponse.json(
        {
          error: 'Required columns not found',
          found: {
            orderCode: orderCodeColIndex !== -1,
            date: dateColIndex !== -1,
            product: productColIndex !== -1,
            quantity: quantityColIndex !== -1,
            amount: amountColIndex !== -1,
          },
        },
        { status: 400 }
      );
    }

    // Group orders by order code
    const ordersMap = new Map<string, GroupedOrder>();

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const orderCode = row.getCell(orderCodeColIndex)?.value?.toString()?.trim() ?? '';
      const dateValue = row.getCell(dateColIndex)?.value;
      const productName = row.getCell(productColIndex)?.value?.toString()?.trim() ?? '';
      const quantity = Number(row.getCell(quantityColIndex)?.value ?? 0);
      const amount = Number(row.getCell(amountColIndex)?.value ?? 0);

      if (!orderCode) return;

      // Parse date
      let dateStr = '';
      if (dateValue instanceof Date) {
        dateStr = formatDate(dateValue);
      } else if (typeof dateValue === 'string') {
        dateStr = dateValue;
      }

      if (!ordersMap.has(orderCode)) {
        ordersMap.set(orderCode, {
          orderCode,
          date: dateStr,
          items: [],
          totalQuantity: 0,
          totalAmount: 0,
        });
      }

      const order = ordersMap.get(orderCode)!;
      order.items.push({
        date: dateStr,
        productName,
        quantity,
        totalAmount: amount,
      });
      order.totalQuantity += quantity;
      order.totalAmount += amount;
    });

    // Create MISA output file
    const outputWorkbook = new ExcelJS.Workbook();
    const outputWorksheet = outputWorkbook.addWorksheet('MISA Invoice');

    // Define headers
    outputWorksheet.columns = [
      { header: 'Dòng số', key: 'lineNumber', width: 10 },
      { header: 'Số thứ tự HĐ', key: 'invoiceNumber', width: 12 },
      { header: 'Ngày hóa đơn', key: 'invoiceDate', width: 15 },
      { header: 'Tên khách hàng', key: 'customerName', width: 15 },
      { header: 'Mã số thuế', key: 'taxCode', width: 12 },
      { header: 'Địa chỉ', key: 'address', width: 20 },
      { header: 'Người mua hàng', key: 'buyer', width: 15 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'Hình thức TT', key: 'paymentMethod', width: 15 },
      { header: 'Thuế suất GTGT (%)', key: 'vatRate', width: 15 },
      { header: 'Tiền thuế GTGT', key: 'vatAmount', width: 15 },
      { header: 'Tên hàng hóa/dịch vụ', key: 'productName', width: 30 },
      { header: 'ĐVT', key: 'unit', width: 10 },
      { header: 'Số lượng', key: 'quantity', width: 10 },
      { header: 'Đơn giá', key: 'unitPrice', width: 15 },
    ];

    let lineNumber = 1;
    let invoiceNumber = 1;
    const orders = Array.from(ordersMap.values());

    orders.forEach((order) => {
      // 1. Tính toán thuế
      const totalAmount = order.totalAmount; 
      const totalBeforeVat = totalAmount / 1.08;
      const vatAmount = totalAmount - totalBeforeVat;
      const unitPrice = totalBeforeVat / order.totalQuantity;

      // 2. Kết hợp tên sản phẩm
      const productNames = order.items.map((item) => item.productName).join(', ');

      // 3. Đổ dữ liệu - Phải khớp với các 'key' đã khai báo ở outputWorksheet.columns
      outputWorksheet.addRow({
        lineNumber: lineNumber++,        // Cột A
        invoiceNumber: invoiceNumber++,  // Cột B
        invoiceDate: order.date,        // Cột C
        customerName: 'Khách lẻ',        // Cột D
        taxCode: '',                     // Cột E
        address: '',                     // Cột F
        buyer: 'Khách lẻ',               // Cột G
        email: '',                       // Cột H
        paymentMethod: 'Chuyển khoản',    // Cột I
        vatRate: 8,                      // Cột J -> Sẽ hiện số 8
        vatAmount: Math.round(vatAmount),// Cột K -> Sẽ hiện tiền thuế
        productName: productNames,       // Cột L
        unit: 'Cái',                     // Cột M
        quantity: order.totalQuantity,   // Cột N
        unitPrice: Math.round(unitPrice) // Cột O
      });
    });

    // Generate output buffer
    const outputBuffer = await outputWorkbook.xlsx.writeBuffer();

    // Return file
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="MISA_Invoice_${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error processing Excel:', error);
    return NextResponse.json(
      { error: 'Failed to process Excel file' },
      { status: 500 }
    );
  }
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
