/**********************************************************************************
 * (c) 2016, Brad Martin.
 * Licensed under the MIT license.
 *
 * Version 3.0.0                                          bradwaynemartin@gmail.com
 **********************************************************************************/

import * as app from 'tns-core-modules/application';
import { Color } from 'tns-core-modules/color';
import { ad as androidUtils } from 'tns-core-modules/utils/utils';

const REQUEST_CODE = 1868;

export function init() {
	console.dir(co.fitcom.fancywebview.AdvancedWebViewStatics);
	console.dir(co.fitcom.fancywebview);
	(co.fitcom.fancywebview.AdvancedWebViewStatics as any).INSTANCE.init(androidUtils.getApplicationContext(), true);
}

export function openAdvancedUrl(options: AdvancedWebViewOptions): any {
	if (!options.url) {
		throw new Error('No url set in the Advanced WebView Options object.');
	}
	app.android.on(app.AndroidApplication.activityResultEvent, (args: any) => {
		const requestCode = args.requestCode;
		const resultCode = args.resultCode;
		if (requestCode === REQUEST_CODE) {
			if (resultCode === android.app.Activity.RESULT_CANCELED) {
				if (options.isClosed && typeof options.isClosed === 'function') {
					options.isClosed(true);
				}
				app.android.off(app.AndroidApplication.activityResultEvent);
			}
		}
	});

	const activity = app.android.startActivity || app.android.foregroundActivity;

	const i = new co.fitcom.fancywebview.AdvancedWebViewListener({
		onCustomTabsServiceConnected(componentName: android.content.ComponentName, client: any) { },
		onServiceDisconnected(componentName: android.content.ComponentName) { },
		onNavigationEvent: function (navigationEvent: number, extras: android.os.Bundle) {
			switch (navigationEvent) {
				case 6:
					if (options.isClosed && typeof options.isClosed === 'function') {
						options.isClosed(true);
					}
					break;
			}
		}
	});

	const wv = new co.fitcom.fancywebview.AdvancedWebView(activity, i);
	const intentBuilder = wv.getBuilder(); // androidx.browser.customtabs.CustomTabsIntent.Builder

	if (intentBuilder) {
		if (options.toolbarColor) {
			intentBuilder.setToolbarColor(new Color(options.toolbarColor).android);
		}

		if (options.showTitle) {
			intentBuilder.setShowTitle(options.showTitle);
		}

		/// Adds a default share item to the menu.
		/// Enables the url bar to hide as the user scrolls down on the page.
		intentBuilder
			.addDefaultShareMenuItem()
			.enableUrlBarHiding()
			.setInstantAppsEnabled(true);
	}

	wv.setBuilder(intentBuilder);
	wv.loadUrl(options.url);
	return wv;
}

export function ios11(
	options: AdvancedWebViewOptions,
	callbackUrlScheme: string,
	callbackFunction
): any {
	return "";
}

export interface AdvancedWebViewOptions {
	url: string;
	toolbarColor?: string;
	showTitle?: boolean;
	isClosed?: Function;
}
