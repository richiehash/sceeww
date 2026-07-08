<?php
declare(strict_types=1);

const SCHOOL_SOLUTIONS_CONTACT_TO = 'contact@schoolsolutions.com';
const SCHOOL_SOLUTIONS_MIN_SECONDS = 3;
const SCHOOL_SOLUTIONS_RATE_LIMIT_SECONDS = 60;

function school_solutions_clean_text(mixed $value, int $maxLength): string
{
    $text = trim((string) $value);
    $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/', '', $text) ?? '';
    $text = preg_replace('/[ \t]+/', ' ', $text) ?? '';

    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength);
    }

    return substr($text, 0, $maxLength);
}

function school_solutions_plain_email(mixed $value): string
{
    return str_replace(["\r", "\n"], '', trim((string) $value));
}

function school_solutions_validate_contact(array $payload, ?int $now = null): array
{
    $now ??= time();
    $errors = [];
    $honeypot = school_solutions_clean_text($payload['company_website'] ?? '', 300);
    $startedAt = (int) ($payload['started_at'] ?? 0);

    if ($honeypot !== '') {
        return ['ok' => false, 'spam' => true, 'errors' => ['Unable to send this message.']];
    }

    if ($startedAt <= 0 || ($now - $startedAt) < SCHOOL_SOLUTIONS_MIN_SECONDS) {
        return ['ok' => false, 'spam' => true, 'errors' => ['Unable to send this message.']];
    }

    $name = school_solutions_clean_text($payload['name'] ?? '', 120);
    $email = school_solutions_plain_email($payload['email'] ?? '');
    $organization = school_solutions_clean_text($payload['organization'] ?? '', 160);
    $projectType = school_solutions_clean_text($payload['project_type'] ?? '', 90);
    $projectDescription = school_solutions_clean_text($payload['project_description'] ?? '', 4000);

    if ($name === '') {
        $errors[] = 'Enter your name.';
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Enter a valid email address.';
    }

    if ($projectType === '') {
        $errors[] = 'Choose a project type.';
    }

    if ($projectDescription === '') {
        $errors[] = 'Describe your project before sending.';
    }

    if ($errors) {
        return ['ok' => false, 'spam' => false, 'errors' => $errors];
    }

    return [
        'ok' => true,
        'spam' => false,
        'errors' => [],
        'data' => [
            'name' => $name,
            'email' => $email,
            'organization' => $organization,
            'project_type' => $projectType,
            'project_description' => $projectDescription,
        ],
    ];
}

function school_solutions_build_contact_email(array $data): array
{
    $name = school_solutions_clean_text($data['name'] ?? '', 120);
    $email = school_solutions_plain_email($data['email'] ?? '');
    $organization = school_solutions_clean_text($data['organization'] ?? '', 160);
    $projectType = school_solutions_clean_text($data['project_type'] ?? '', 90);
    $projectDescription = school_solutions_clean_text($data['project_description'] ?? '', 4000);
    $subject = 'New project inquiry from ' . $name;

    $body = implode("\n\n", [
        'New project inquiry from the School Solutions website.',
        'Name: ' . $name,
        'Email: ' . $email,
        'Organization: ' . ($organization !== '' ? $organization : 'Not provided'),
        'Project type: ' . $projectType,
        "Describe your project:\n" . $projectDescription,
    ]);

    $headers = implode("\r\n", [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'From: School Solutions Website <no-reply@schoolsolutions.com>',
        'Reply-To: ' . $name . ' <' . $email . '>',
        'X-Mailer: PHP/' . phpversion(),
    ]);

    return [
        'to' => SCHOOL_SOLUTIONS_CONTACT_TO,
        'subject' => $subject,
        'body' => $body,
        'headers' => $headers,
    ];
}

function school_solutions_is_rate_limited(array $session, int $now): bool
{
    $lastSubmission = (int) ($session['school_solutions_last_contact'] ?? 0);

    return $lastSubmission > 0 && ($now - $lastSubmission) < SCHOOL_SOLUTIONS_RATE_LIMIT_SECONDS;
}
