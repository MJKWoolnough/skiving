#!/bin/bash

(
	head -n5 index.html;
	echo -n "		<script type=\"module\">"
	jspacker -i /script.js -n | terser -m --module --compress pure_getters,passes=3 --ecma 6 | tr -d '\n';
	echo "</script>";
	tail -n5 index.html;
) > skiving.html;
