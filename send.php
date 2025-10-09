<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

// Поддержка JSON-постов и обычной формы
$isJson = stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false;
if ($isJson) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];
    $fio   = trim($data['name'] ?? $data['fio'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $exp   = intval($data['experience'] ?? $data['exp'] ?? 0);
    $docs  = $data['docs'] ?? [];
} else {
    $fio   = trim($_POST['fio'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $exp   = intval($_POST['exp'] ?? 0);
    $docs  = $_POST['docs'] ?? [];
}

if (mb_strlen($fio) < 6 || !preg_match('/^\+375\d{9}$/', $phone) || $exp < 2) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'validation_failed']);
    exit;
}

$to = "lojour.pinsk@yandex.by"; // куда отправлять
$subject = "Новая анкета с сайта";
$body = "ФИО: $fio\nТелефон: $phone\nСтаж: $exp\nДокументы: " . (is_array($docs)?implode(', ',$docs):'');
$headers = "From: no-reply@lojour.by\r\nContent-Type: text/plain; charset=utf-8";

// Для локальной разработки можно выключить отправку письма
$DEV_NO_MAIL = false; // true -> не отправлять, просто отвечать ok

if ($DEV_NO_MAIL) {
    echo json_encode(['ok' => true, 'dev' => true]);
    exit;
}

if (mail($to, $subject, $body, $headers)) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'mail_failed']);
}
