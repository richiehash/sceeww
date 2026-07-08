<?php
declare(strict_types=1);

require __DIR__ . '/../contact-handler.php';

$failures = [];

function assert_true(bool $condition, string $message): void
{
    global $failures;

    if (!$condition) {
        $failures[] = $message;
    }
}

function assert_same(mixed $expected, mixed $actual, string $message): void
{
    global $failures;

    if ($expected !== $actual) {
        $failures[] = $message . ' Expected: ' . var_export($expected, true) . ' Actual: ' . var_export($actual, true);
    }
}

function valid_payload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Maria Ortiz',
        'email' => 'maria@example.com',
        'organization' => 'North Valley District',
        'project_type' => 'Assessment',
        'project_description' => 'We need benchmark items and standards alignment for grades 6-8 science.',
        'company_website' => '',
        'started_at' => (string) (time() - 8),
    ], $overrides);
}

$valid = school_solutions_validate_contact(valid_payload(), time());
assert_true($valid['ok'], 'Valid contact payload should pass validation.');
assert_same('Maria Ortiz', $valid['data']['name'] ?? null, 'Valid name should be normalized into data.');
assert_same('maria@example.com', $valid['data']['email'] ?? null, 'Valid email should be normalized into data.');

$missingDescription = school_solutions_validate_contact(valid_payload(['project_description' => '']), time());
assert_true(!$missingDescription['ok'], 'Project description should be required.');
assert_true(in_array('Describe your project before sending.', $missingDescription['errors'], true), 'Missing project description should return a clear error.');

$badEmail = school_solutions_validate_contact(valid_payload(['email' => 'not-an-email']), time());
assert_true(!$badEmail['ok'], 'Invalid email should fail validation.');
assert_true(in_array('Enter a valid email address.', $badEmail['errors'], true), 'Invalid email should return a clear error.');

$honeypot = school_solutions_validate_contact(valid_payload(['company_website' => 'https://spam.example']), time());
assert_true(!$honeypot['ok'], 'Filled honeypot should be rejected.');
assert_same(true, $honeypot['spam'] ?? null, 'Filled honeypot should be marked as spam.');

$tooFast = school_solutions_validate_contact(valid_payload(['started_at' => (string) (time() - 1)]), time());
assert_true(!$tooFast['ok'], 'Submissions that are too fast should be rejected.');
assert_same(true, $tooFast['spam'] ?? null, 'Too-fast submissions should be marked as spam.');

$email = school_solutions_build_contact_email($valid['data']);
assert_same('New project inquiry from Maria Ortiz', $email['subject'], 'Email subject should include sender name.');
assert_true(str_contains($email['body'], 'Describe your project:'), 'Email body should include the description heading.');
assert_true(str_contains($email['body'], 'North Valley District'), 'Email body should include organization.');
assert_true(str_contains($email['headers'], 'Reply-To: Maria Ortiz <maria@example.com>'), 'Email headers should set Reply-To safely.');

if ($failures) {
    fwrite(STDERR, implode(PHP_EOL, $failures) . PHP_EOL);
    exit(1);
}

echo 'contact-handler tests passed' . PHP_EOL;
