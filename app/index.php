<?php
require './../vendor/autoload.php';

$smarty = new Smarty();

$smarty->caching = true;
$smarty->compile_check = false;
$smarty->template_dir = './templates/';
$smarty->compile_dir  = './templates_c/';
$smarty->config_dir   = './configs/';
$smarty->cache_dir    = './cache/';

$smarty->left_delimiter = '<{';
$smarty->right_delimiter = '}>';

$smarty->assign('pageTitle', 'Edit Run Route');
$smarty->assign('googleMapApiKey', '');
$smarty->assign('googleAnalyticsTrackingId', '');

$smarty->display('index.tpl');