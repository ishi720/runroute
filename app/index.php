<?php
require './../vendor/autoload.php';

$smarty = new Smarty();

$smarty->caching = true;
$smarty->compile_check = false;
$smarty->template_dir = './templates/';
$smarty->compile_dir  = './templates_c/';
$smarty->config_dir   = './configs/';
$smarty->cache_dir    = './cache/';

$smarty->assign('pageTitle', 'Edit Run Route');

$smarty->display('index.tpl');