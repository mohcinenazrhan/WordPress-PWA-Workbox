<?php
  header('Service-Worker-Allowed: /');
  header('Content-Type: application/javascript');
  readfile('sw.js');
?>