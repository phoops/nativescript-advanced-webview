/**********************************************************************************
 * (c) 2016, Brad Martin.
 * Licensed under the MIT license.
 *
 * Version 3.0.0                                          bradwaynemartin@gmail.com
 **********************************************************************************/

import { Color } from 'tns-core-modules/color';

class SFSafariViewControllerDelegateImpl extends NSObject implements SFSafariViewControllerDelegate {
	public static ObjCProtocols = [SFSafariViewControllerDelegate];

	private _owner: WeakRef<any>;
	private _callback: Function;
	public static initWithOwnerCallback(owner: WeakRef<any>, callback: Function): SFSafariViewControllerDelegateImpl {
		// let delegate = <SFSafariViewControllerDelegateImpl>SFSafariViewControllerDelegateImpl.new();
		let delegate = <SFSafariViewControllerDelegateImpl>(SFSafariViewControllerDelegateImpl.new());
		delegate._owner = owner;
		delegate._callback = callback;
		return delegate;
	}

	safariViewControllerDidCompleteInitialLoad(controller: SFSafariViewController, didLoadSuccessfully: boolean): void {
		console.log('Delegate, safariViewControllerDidCompleteInitialLoad: ' + didLoadSuccessfully);
	}

	safariViewControllerDidFinish(controller: SFSafariViewController): void {
		if (this._callback && typeof this._callback === 'function') {
			this._callback(true);
		}
	}
}

export function init() { }

export function openAdvancedUrl(options: AdvancedWebViewOptions): any {

	console.log("[advanced-webview] android or ios < 11");

	if (!options.url) {
		throw new Error('No url set in the Advanced WebView Options object.');
	}

	const sfc = SFSafariViewController.alloc().initWithURL(NSURL.URLWithString(options.url));

	if (options.toolbarColor) {
		sfc.preferredBarTintColor = new Color(options.toolbarColor).ios;
	}

	if (options.toolbarControlsColor) {
		sfc.preferredControlTintColor = new Color(options.toolbarControlsColor).ios;
	}

	sfc.delegate = SFSafariViewControllerDelegateImpl.initWithOwnerCallback(new WeakRef({}), options.isClosed);

	const app = UIApplication.sharedApplication;

	const animated = true;
	const completionHandler = null;
	app.keyWindow.rootViewController.presentViewControllerAnimatedCompletion(sfc, animated, completionHandler);

	return sfc;
}

export function ios11(
	options: AdvancedWebViewOptions,
	callbackUrlScheme: string,
	handler
): any {

	console.log("[advanced-webview] ios >=11");

	let authURL: NSURL = NSURL.alloc();
	authURL = authURL.initWithString(options.url);

	let callbackFunction = null;
	if (handler != null) {
		callbackFunction = function (callBack: NSURL, error: NSError) {
			console.log("completionHandler");
			console.log(callBack);
			if (error != null) {
				console.log(error);
			} else {
				const params = getAllUrlParams(callBack.absoluteString);
				console.log(params);
				handler(params, false);
			}
		};
	}

	//Initialize auth session
	const authSession: ASWebAuthenticationSession = ASWebAuthenticationSession.alloc();
	authSession.initWithURLCallbackURLSchemeCompletionHandler(
		authURL,
		callbackUrlScheme,
		callbackFunction
	);
	console.log("Session start");
	let res: boolean = authSession.start();
}

export interface AdvancedWebViewOptions {
	url: string;
	showTitle?: boolean;
	toolbarColor?: string;
	toolbarControlsColor?: string;
	isClosed?: Function;
}

function getAllUrlParams(url) {
	var queryString = url ? url.split("?")[1] : window.location.search.slice(1);
	var obj = {};

	if (queryString) {
		queryString = queryString.split("#")[0];
		var arr = queryString.split("&");

		for (var i = 0; i < arr.length; i++) {
			var a = arr[i].split("=");
			var paramNum = undefined;
			var paramName = a[0].replace(/\[\d*\]/, function (v) {
				paramNum = v.slice(1, -1);
				return "";
			});

			var paramValue = typeof a[1] === "undefined" ? true : a[1];

			if (obj[paramName]) {
				if (typeof obj[paramName] === "string") {
					obj[paramName] = [obj[paramName]];
				}
				if (typeof paramNum === "undefined") {
					obj[paramName].push(paramValue);
				} else {
					obj[paramName][paramNum] = paramValue;
				}
			} else {
				obj[paramName] = paramValue;
			}
		}
	}
	return obj;
}
