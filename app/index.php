<?php
require './../vendor/autoload.php';
use Symfony\Component\Yaml\Yaml;
$config = Yaml::parseFile('../configs/config.yaml');

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
$smarty->assign('googleMapApiKey', $config['googleMapApiKey']);
$smarty->assign('googleAnalyticsTrackingId', $config['googleAnalyticsTrackingId']);

$smarty->display('index.tpl');