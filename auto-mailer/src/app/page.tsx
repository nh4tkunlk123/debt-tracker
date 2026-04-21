import EmailSender from '@/components/EmailSender';

export const metadata = {
  title: 'Auto Mailer - Personal Email Tool',
  description: 'Send automatic emails via Gmail SMTP',
};

export default function Home() {
  return (
    <main>
      <EmailSender />
    </main>
  );
}
