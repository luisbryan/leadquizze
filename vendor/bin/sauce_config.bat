@ECHO OFF
SET BIN_TARGET=%~dp0/../sauce/sausage/bin/sauce_config
php "%BIN_TARGET%" %*
