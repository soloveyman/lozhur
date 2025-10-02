<?php
// send.php
header('Content-Type: application/json; charset=utf-8');

// Настроить!
$TO_EMAIL = 'soloveymann@gmail.com.com';     // Куда слать
$FROM_EMAIL = 'no-reply@yourdomain.tld'; // От кого (желательно домен твоего сайта)
$SUBJECT = 'ЛОЖУР: новая анкета';

function json_exit($arr) {
  echo json_encode($arr, JSON_UNESCAPED_UNICODE);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  json_exit(['ok' => false, 'error' => 'Method not allowed']);
}

// Достаём данные
$fio   = trim($_POST['fio']   ?? '');
$phone = trim($_POST['phone'] ?? '');
$exp   = trim($_POST['exp']   ?? '');
$docsList = trim($_POST['docs_list'] ?? '');

// Мини-валидация на сервере (обязательно!)
if (mb_strlen($fio) < 6 || !preg_match('/^\+375\d{9}$/', $phone) || (int)$exp < 2) {
  http_response_code(422);
  json_exit(['ok' => false, 'error' => 'Проверьте ФИО, телефон и стаж (>= 2).']);
}

// Письмо (текст и HTML)
$bodyText = "Новая анкета ЛОЖУР\n\n"
  ."ФИО: $fio\n"
  ."Телефон: $phone\n"
  ."Стаж (кат. B): $exp\n"
  ."Документы: ".($docsList ?: 'не выбрано')."\n";

$bodyHtml = '<html><body style="font-family:Arial,sans-serif">'
  .'<h2>Новая анкета ЛОЖУР</h2>'
  .'<p><b>ФИО:</b> '.htmlspecialchars($fio, ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8').'</p>'
  .'<p><b>Телефон:</b> '.htmlspecialchars($phone, ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8').'</p>'
  .'<p><b>Стаж (кат. B):</b> '.htmlspecialchars($exp, ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8').'</p>'
  .'<p><b>Документы:</b> '.htmlspecialchars($docsList ?: 'не выбрано', ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8').'</p>'
  .'</body></html>';

// Письмо в формате multipart/alternative
$boundary = '==Multipart_'.md5(uniqid('', true));
$headers  = "From: ЛОЖУР <{$FROM_EMAIL}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";

$message  = "--$boundary\r\n";
$message .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
$message .= $bodyText . "\r\n";
$message .= "--$boundary\r\n";
$message .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
$message .= $bodyHtml . "\r\n";
$message .= "--$boundary--";

// Отправка
$ok = mail($TO_EMAIL, '=?UTF-8?B?'.base64_encode($SUBJECT).'?=', $message, $headers);

if ($ok) {
  json_exit(['ok' => true]);
} else {
  http_response_code(500);
  json_exit(['ok' => false, 'error' => 'mail() вернул ошибку. Проверьте настройку почты на хостинге.']);
}
