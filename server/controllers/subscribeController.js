import nodemailer from "nodemailer";

export const subscribeHandler = async (req, res) => {
    const { name, email } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,  // App Password
            },
        });

        await transporter.sendMail({
            from: email,
            to: process.env.EMAIL_USER,
            subject: "New Newsletter Subscription",
            html: `<h2>New Subscriber</h2>
                   <p><strong>Name:</strong> ${name}</p>
                   <p><strong>Email:</strong> ${email}</p>`,
        });

        return res.status(200).json({ message: "Email sent successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
