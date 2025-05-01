<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load Composer's autoloader
require '../vendor/autoload.php'; // Adjust path if necessary

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $name    = htmlspecialchars($_POST['name']);
    $email   = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    if (!$email) {
        http_response_code(400);
        echo 'Invalid email format.';
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        // SMTP Configuration
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'harireddy9915@gmail.com';       // Your Gmail
        $mail->Password   = 'xnyzmwwdljddsihs';              // App Password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;

        // Recipients
        $mail->setFrom('harireddy9915@gmail.com', 'Hari Prasad Reddy');
        $mail->addAddress('harireddy9915@gmail.com', 'Hari Prasad Reddy');

        // Email Content
        $mail->isHTML(true);
        $mail->Subject = "Portfolio Contact: $subject";
        $mail->Body    = "
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> $name</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Subject:</strong> $subject</p>
            <p><strong>Message:</strong><br>" . nl2br($message) . "</p>
        ";
        $mail->AltBody = "New Contact Message:\nName: $name\nEmail: $email\nSubject: $subject\nMessage: $message";

        $mail->send();
        echo 'OK'; // Must be exactly "OK" for validate.js to work
    } catch (Exception $e) {
        http_response_code(500);
        echo "Mailer Error: {$mail->ErrorInfo}";
    }

} else {
    http_response_code(405);
    echo 'Invalid request method.';
}
?>
