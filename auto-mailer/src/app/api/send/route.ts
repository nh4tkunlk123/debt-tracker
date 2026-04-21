import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fromEmail, appPassword, to, subject, html } = body;

        if (!fromEmail || !appPassword || !to || !subject || !html) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc (Email, Password, Người nhận, Tiêu đề, Nội dung)' },
                { status: 400 }
            );
        }

        // 1. Tạo Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: fromEmail,
                pass: appPassword,
            },
        });

        // 2. Kiểm tra kết nối
        await transporter.verify();

        // 3. Gửi mail
        const info = await transporter.sendMail({
            from: fromEmail,
            to: to, // Có thể là chuỗi "a@b.com, c@d.com"
            subject: subject,
            html: html,
        });

        console.log('Message sent: %s', info.messageId);

        return NextResponse.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
        console.error('Lỗi gửi mail:', error);
        return NextResponse.json(
            { error: error?.message || 'Có lỗi xảy ra khi gửi mail.' },
            { status: 500 }
        );
    }
}
