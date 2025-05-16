const [showModal, setShowModal] = useState(false);
const [formData, setFormData] = useState({ name: '', email: '', message: '' });
const [sending, setSending] = useState(false);
const [sent, setSent] = useState(false);

const handleSendEmail = (e) => {
  e.preventDefault();
  setSending(true);

  emailjs.send('your_service_id', 'your_template_id', {
    from_name: formData.name,
    reply_to: formData.email,
    message: formData.message,
  }, 'your_public_key')
    .then(() => {
      setSent(true);
      setFormData({ name: '', email: '', message: '' });
      setSending(false);
      setTimeout(() => setShowModal(false), 2000);
    })
    .catch(() => {
      setSending(false);
      alert("Something went wrong. Please try again.");
    });
};
