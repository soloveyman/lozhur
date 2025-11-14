<?php
// Simple JSON API endpoint for form submission
// Matches frontend expectation: returns { ok: true } on success, { error: string } otherwise

// Force JSON response
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Allow only POST
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method Not Allowed']);
  exit;
}

// Parse input (supports both form-data and JSON bodies)
$contentType = $_SERVER['CONTENT_TYPE'] ?? ($_SERVER['HTTP_CONTENT_TYPE'] ?? '');
$isJson = stripos($contentType, 'application/json') !== false;

if ($isJson) {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  if (!is_array($data)) $data = [];
} else {
  $data = $_POST;
}

// Helper to fetch trimmed values
$get = function (string $key) use ($data): string {
  return isset($data[$key]) ? trim((string)$data[$key]) : '';
};

// Honeypot (optional field commonly named 'botcheck')
$botcheck = $get('botcheck');
if ($botcheck !== '') {
  // Silently accept to avoid helping bots tune payloads
  echo json_encode(['ok' => true, 'message' => 'Thanks']);
  exit;
}

// Collect known fields (add/rename as your form requires)
$fio       = $get('fio');
$phone     = $get('phone');
$exp       = $get('exp');
$emailRaw  = $get('email');
$email     = filter_var($emailRaw, FILTER_VALIDATE_EMAIL) ? $emailRaw : '';
$name      = $get('name');
$message   = $get('message');
$docsList  = $get('docs_list');

// Basic validation (tune rules to match frontend)
$errors = [];
if ($fio !== '' && mb_strlen($fio) < 2) { $errors[] = 'fio'; }
if ($phone === '') { $errors[] = 'phone'; }
if ($exp !== '' && !is_numeric($exp)) { $errors[] = 'exp'; }
if ($emailRaw !== '' && $email === '') { $errors[] = 'email'; }

if (!empty($errors)) {
  http_response_code(422);
  echo json_encode([
    'error'  => 'Validation error',
    'fields' => $errors
  ]);
  exit;
}

// Configure recipient
$to = 'lojour.pinsk@yandex.by';

// Compose email
$subject = 'New form submission from site';
$lines = [];
if ($fio !== '')     { $lines[] = 'FIO: ' . $fio; }
if ($name !== '')    { $lines[] = 'Name: ' . $name; }
if ($email !== '')   { $lines[] = 'Email: ' . $email; }
if ($phone !== '')   { $lines[] = 'Phone: ' . $phone; }
if ($exp !== '')     { $lines[] = 'Experience: ' . $exp; }
if ($docsList !== ''){ $lines[] = 'Docs: ' . $docsList; }
if ($message !== '') { $lines[] = "Message:\n" . $message; }

// Include individual boolean flags for any docs_* fields
foreach ($data as $k => $v) {
  if (strpos($k, 'docs_') === 0) {
    $title = strtoupper(str_replace('_', ' ', substr($k, 5)));
    $val = (string)$v;
    $lines[] = 'DOC ' . $title . ': ' . ($val === 'true' ? 'true' : 'false');
  }
}

// Include explicit ordered values (docs_value_1, docs_value_2, ...)
$orderedValues = [];
foreach ($data as $k => $v) {
  if (preg_match('/^docs_value_(\d+)$/', $k, $m)) {
    $orderedValues[(int)$m[1]] = (string)$v;
  }
}
if (!empty($orderedValues)) {
  ksort($orderedValues, SORT_NUMERIC);
  $lines[] = 'Docs values:';
  foreach ($orderedValues as $idx => $val) {
    $lines[] = '  #' . $idx . ': ' . $val;
  }
}

$body = implode("\n", $lines);

// Headers
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

// Robust From to satisfy hosting providers
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$fromEmail = 'no-reply@' . preg_replace('/^www\./', '', $host);
$fromName  = 'Website';
$headers[] = 'From: ' . $fromName . ' <' . $fromEmail . '>';

if ($email !== '') {
  // Set Reply-To if user provided email
  $headers[] = 'Reply-To: ' . $email;
}
$headersStr = implode("\r\n", $headers);

// Send
// Use envelope sender (-f) to improve deliverability on many hosts
$params = '-f ' . $fromEmail;
$sent = @mail($to, $encodedSubject, $body, $headersStr, $params);

if ($sent) {
  echo json_encode(['ok' => true]);
} else {
  http_response_code(500);
  echo json_encode(['error' => 'Mail send failed']);
}


