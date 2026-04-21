'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, Send, Settings, Eye, Save, RotateCcw, CheckCircle, AlertTriangle, Bold, Italic, Link as LinkIcon, Box, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import styles from './EmailSender.module.css';

const TEMPLATES = {
    empty: { name: 'Trống', subject: '', html: '' },
    welcome: {
        name: 'Chào mừng (Welcome)',
        subject: 'Chào mừng bạn đến với cộng đồng!',
        html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  <h2 style="color: #4F46E5;">Chào mừng bạn! 🎉</h2>
  <p>Cảm ơn bạn đã đăng ký tham gia.</p>
  <p>Chúng tôi rất vui được đồng hành cùng bạn.</p>
  <br>
  <a href="#" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Bắt đầu ngay</a>
</div>`
    },
    promo: {
        name: 'Khuyến mãi (Sale)',
        subject: '🔥 Ưu đãi đặc biệt chỉ hôm nay!',
        html: `<div style="font-family: Arial, sans-serif; color: #333; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
  <h2 style="color: #E11D48; text-align: center;">GIẢM GIÁ 50%</h2>
  <p>Xin chào,</p>
  <p>Đừng bỏ lỡ cơ hội sở hữu sản phẩm yêu thích với mức giá không thể tốt hơn.</p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="#" style="background-color: #E11D48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">MUA NGAY</a>
  </div>
  <p style="font-size: 0.8em; color: #666; text-align: center;">Chương trình áp dụng đến hết tuần.</p>
</div>`
    },
    news: {
        name: 'Bản tin (Newsletter)',
        subject: 'Bản tin cập nhật tuần này',
        html: `<div style="font-family: 'Helvetica', sans-serif; color: #1e293b;">
  <h1 style="border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Tin Tức Mới Nhất</h1>
  <p>Chào bạn,</p>
  <p>Dưới đây là tóm tắt các hoạt động nổi bật trong tuần qua:</p>
  <ul>
    <li>🚀 Ra mắt tính năng mới</li>
    <li>📈 Tăng trưởng người dùng 20%</li>
    <li>🤝 Hợp tác chiến lược mới</li>
  </ul>
  <p>Hẹn gặp lại bạn vào tuần sau!</p>
</div>`
    }
};

export default function EmailSender() {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const [settings, setSettings] = useState({
        fromEmail: '',
        appPassword: '',
    });

    const [email, setEmail] = useState({
        to: '',
        subject: '',
        html: '',
    });

    // Load saved credentials on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('am_email');
        const savedPass = localStorage.getItem('am_pass');
        if (savedEmail || savedPass) {
            setSettings({
                fromEmail: savedEmail || '',
                appPassword: savedPass || '',
            });
        }
    }, []);

    const saveCredentials = () => {
        localStorage.setItem('am_email', settings.fromEmail);
        localStorage.setItem('am_pass', settings.appPassword);
        alert('Đã lưu thông tin đăng nhập vào trình duyệt của bạn!');
    };

    const handleTemplateChange = (key: string) => {
        // @ts-ignore
        const t = TEMPLATES[key];
        if (t) {
            if (confirm('Nội dung hiện tại sẽ bị thay thế. Bạn có chắc chắn không?')) {
                setEmail({ ...email, subject: t.subject, html: t.html });
            }
        }
    };

    const insertTag = (tag: string) => {
        const textarea = textAreaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = email.html;

        let replacement = '';

        switch (tag) {
            case 'b':
                replacement = `<b>${text.substring(start, end) || 'In đậm'}</b>`;
                break;
            case 'i':
                replacement = `<i>${text.substring(start, end) || 'In nghiêng'}</i>`;
                break;
            case 'a':
                const aUrl = prompt('Nhập đường dẫn (URL):', 'https://');
                if (aUrl) {
                    replacement = `<a href="${aUrl}" target="_blank" style="color: #4F46E5; text-decoration: underline;">${text.substring(start, end) || 'Link'}</a>`;
                }
                break;
            case 'br':
                replacement = '<br>';
                break;
            case 'btn':
                const bUrl = prompt('Nhập đường dẫn (URL) cho nút:', 'https://');
                if (bUrl) {
                    const bText = prompt('Nhập chữ trên nút:', 'Xem Ngay');
                    replacement = `<a href="${bUrl}" target="_blank" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">${bText || 'Xem Ngay'}</a>`;
                }
                break;
            case 'left':
                replacement = `<div style="text-align: left;">${text.substring(start, end) || 'Nội dung'}</div>`;
                break;
            case 'center':
                replacement = `<div style="text-align: center;">${text.substring(start, end) || 'Nội dung'}</div>`;
                break;
            case 'right':
                replacement = `<div style="text-align: right;">${text.substring(start, end) || 'Nội dung'}</div>`;
                break;
        }

        const newText = text.substring(0, start) + replacement + text.substring(end);
        setEmail({ ...email, html: newText });

        // Cần settimeout để focus hoạt động đúng sau khi state update
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + replacement.length, start + replacement.length);
        }, 0);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const recipientList = email.to
            .split(/[\n,]+/)
            .map((e) => e.trim())
            .filter((e) => e.length > 0);

        if (recipientList.length === 0) {
            setStatus({ type: 'error', message: 'Vui lòng nhập ít nhất 1 email người nhận.' });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...settings,
                    to: recipientList.join(', '),
                    subject: email.subject,
                    html: email.html,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setStatus({ type: 'success', message: `Đã gửi thành công đến ${recipientList.length} địa chỉ!` });
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.iconWrapper}>
                    <Mail size={48} color="#6366F1" />
                </div>
                <h1 className={styles.title}>Auto Mailer Pro</h1>
                <p className={styles.subtitle}>Hệ thống gửi email tự động cá nhân hóa cao cấp</p>
            </header>

            <div className={styles.grid}>
                {/* Left Panel: Settings */}
                <div className={`${styles.panel} glass-panel`}>
                    <div className={styles.sectionTitle}>
                        <Settings size={20} /> Cấu hình gửi (SMTP)
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email của bạn</label>
                        <input
                            type="email"
                            className={`${styles.input} glass-input`}
                            placeholder="name@gmail.com"
                            value={settings.fromEmail}
                            onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>App Password</label>
                        <input
                            type="password"
                            className={`${styles.input} glass-input`}
                            placeholder="•••• •••• •••• ••••"
                            value={settings.appPassword}
                            onChange={(e) => setSettings({ ...settings, appPassword: e.target.value })}
                        />
                    </div>

                    <button
                        type="button"
                        className={styles.buttonSecondary}
                        onClick={saveCredentials}
                        title="Lưu vào trình duyệt để lần sau không cần nhập"
                    >
                        <Save size={16} style={{ display: 'inline', marginRight: 5 }} /> Lưu cấu hình
                    </button>

                    <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
                        <p>ℹ️ Mật khẩu ứng dụng 16 ký tự.</p>
                        <a href="https://myaccount.google.com/apppasswords" target="_blank" style={{ color: '#818cf8', textDecoration: 'underline' }}>Lấy mã tại đây</a>
                    </div>
                </div>

                {/* Right Panel: Compose */}
                <form className={`${styles.panel} glass-panel`} onSubmit={handleSend}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className={styles.tabs}>
                            <button
                                type="button"
                                className={`${styles.tab} ${activeTab === 'compose' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('compose')}
                            >
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <RotateCcw size={14} /> Soạn thảo
                                </div>
                            </button>
                            <button
                                type="button"
                                className={`${styles.tab} ${activeTab === 'preview' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('preview')}
                            >
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <Eye size={14} /> Xem trước
                                </div>
                            </button>
                        </div>
                    </div>

                    {activeTab === 'compose' ? (
                        <>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Người nhận (Danh sách)</label>
                                <textarea
                                    className={`${styles.textarea} glass-input`}
                                    style={{ minHeight: '80px' }}
                                    placeholder="email1@gmail.com,&#10;email2@yahoo.com"
                                    value={email.to}
                                    onChange={(e) => setEmail({ ...email, to: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Tiêu đề Email</label>
                                <input
                                    type="text"
                                    className={`${styles.input} glass-input`}
                                    placeholder="Tiêu đề hấp dẫn..."
                                    value={email.subject}
                                    onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className={styles.label}>Nội dung (HTML)</label>

                                    <select
                                        className={styles.templateSelect}
                                        onChange={(e) => handleTemplateChange(e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>-- Chọn mẫu --</option>
                                        {Object.entries(TEMPLATES).map(([key, t]) => (
                                            <option key={key} value={key}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.toolbar}>
                                    <button type="button" className={styles.toolbarBtn} onClick={() => insertTag('b')} title="In đậm"><Bold size={14} /> Bold</button>
                                    <button type="button" className={styles.toolbarBtn} onClick={() => insertTag('i')} title="In nghiêng"><Italic size={14} /> Italic</button>
                                    <button type="button" className={styles.toolbarBtn} onClick={() => insertTag('a')} title="Chèn Link"><LinkIcon size={14} /> Link</button>
                                    <button type="button" className={styles.toolbarBtn} onClick={() => insertTag('btn')} title="Chèn Nút"><Box size={14} /> Button</button>
                                    <button type="button" className={styles.toolbarBtn} onClick={() => insertTag('br')} title="Xuống dòng"><Type size={14} /> BR</button>
                                    <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }}></div>
                                    <button type="button" className={styles.toolbarBtn} onClick={() => insertTag('left')} title="Căn trái"><AlignLeft size={14} /></button>
                                    <button type="button" className={styles.toolbarBtn} onClick={() => insertTag('center')} title="Căn giữa"><AlignCenter size={14} /></button>
                                    <button type="button" className={styles.toolbarBtn} onClick={() => insertTag('right')} title="Căn phải"><AlignRight size={14} /></button>
                                </div>

                                <textarea
                                    ref={textAreaRef}
                                    className={`${styles.textarea} glass-input`}
                                    placeholder="<h1>Xin chào,</h1><p>Đây là nội dung...</p>"
                                    value={email.html}
                                    onChange={(e) => setEmail({ ...email, html: e.target.value })}
                                    style={{ fontFamily: 'monospace' }}
                                />
                            </div>
                        </>
                    ) : (
                        <div className={styles.previewBox}>
                            {email.html ? (
                                <div dangerouslySetInnerHTML={{ __html: email.html }} />
                            ) : (
                                <p style={{ color: '#999', textAlign: 'center', marginTop: 50 }}>Chưa có nội dung để xem trước</p>
                            )}
                        </div>
                    )}

                    {status && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            border: `1px solid ${status.type === 'success' ? '#10B981' : '#EF4444'}`,
                            color: status.type === 'success' ? '#34D399' : '#F87171',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                            {status.message}
                        </div>
                    )}

                    <div className={styles.actions}>
                        <button type="submit" className={styles.buttonPrimary} disabled={loading}>
                            <Send size={18} /> {loading ? 'Đang gửi...' : 'Gửi Ngay'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
