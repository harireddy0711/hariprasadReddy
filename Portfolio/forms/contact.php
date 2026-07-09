<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $name    = htmlspecialchars($_POST['name'] ?? '');
    $email   = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    $subject = htmlspecialchars($_POST['subject'] ?? '');
    $message = htmlspecialchars($_POST['message'] ?? '');

    if (!$email) {
        http_response_code(400);
        echo 'Invalid email format.';
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.ionos.co.uk';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'harireddy@hariprasadreddy.co.uk';
        $mail->Password   = 'HARI@071120';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('harireddy@hariprasadreddy.co.uk', 'Hari Prasad Reddy');
        $mail->addAddress('harireddy@hariprasadreddy.co.uk', 'Hari Prasad Reddy');
        $mail->addReplyTo($email, $name);

        $mail->isHTML(true);
        $mail->Subject = "Portfolio Contact: $subject";
        $mail->Body = "
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> $name</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Subject:</strong> $subject</p>
            <p><strong>Message:</strong><br>" . nl2br($message) . "</p>
        ";

        $mail->AltBody = "Name: $name\nEmail: $email\nSubject: $subject\nMessage: $message";

        $mail->send();
        echo 'OK';

    } catch (Exception $e) {
        http_response_code(500);
        echo "Mailer Error: " . $mail->ErrorInfo;
    }

} else {
    http_response_code(405);
    echo 'Invalid request method.';
}
?>