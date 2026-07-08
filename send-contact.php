<?php
declare(strict_types=1);

require __DIR__ . '/contact-handler.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Use the contact form to send a message.']);
    exit;
}

session_start();

$now = time();

if (school_solutions_is_rate_limited($_SESSION, $now)) {
    http_response_code(429);
    echo json_encode([
        'ok' => false,
        'message' => 'Please wait a minute before sending another message.',
    ]);
    exit;
}

$validation = school_solutions_validate_contact($_POST, $now);

if (!$validation['ok']) {
    if (($validation['spam'] ?? false) === true) {
        echo json_encode([
            'ok' => true,
            'message' => 'Thanks. Your message has been received.',
        ]);
        exit;
    }

    http_response_code(422);
    echo json_encode([
        'ok' => false,
        'message' => implode(' ', $validation['errors']),
        'errors' => $validation['errors'],
    ]);
    exit;
}

$email = school_solutions_build_contact_email($validation['data']);
$sent = mail($email['to'], $email['subject'], $email['body'], $email['headers']);

if (!$sent) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'The message could not be sent. Please email contact@schoolsolutions.com directly.',
    ]);
    exit;
}

$_SESSION['school_solutions_last_contact'] = $now;

echo json_encode([
    'ok' => true,
    'message' => 'Thanks. Your message has been sent.',
]);
