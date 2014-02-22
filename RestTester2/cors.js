var
    headersBlackList,
    defaultScheme;
headersBlackList = ['Host', 'Date', 'Server', 'Content-Length'];
defaultScheme = "http://";

function formatHeaderName(headerName) {
    "use strict";
    headerName = headerName.toLowerCase();
    headerName = headerName.split('_');
    return headerName.map(
        function UpperCaseFirst(namePart) {
            return namePart[0].toUpperCase() + namePart.substr(1);
        }
    ).join('-');
}

function handleCORSMethod(request, response) {
    "use strict";

    var
        req,
        scheme,
        urlToCall,
        headers;

	// add CORS headers
    response.headers["Access-Control-Allow-Origin"] = "*";
    response.headers["Access-Control-Allow-Headers"] = "Content-Type";
	if (request.method === "OPTIONS") {
		// Client is asking for the allowed methods
		response.headers["Access-control-allow-methods"] = "POST,GET,PUT,DELETE,OPTIONS";
		return;
	}

    /*
     * manage the Request to transfert
     */
    headers = request.headers;
    req = new XMLHttpRequest();

    // get the scheme 
    if (request.hasOwnProperty('isSSL')) {
	    scheme = request.isSSL ? 'https://' : 'http://';
    } else {
        scheme = defaultScheme;
    }
    // format the request URL
   urlToCall = scheme + request.host + request.url.replace("/cors/", "/rest/");

	// set request method and URL
    req.open(request.method, urlToCall, false);
    // copy request headers
    Object.keys(headers).forEach(
        function setRequestHeader(headerName) {
            var
                headerValue;
            headerValue = headers[headerName];
            headerName = formatHeaderName(headerName);
            if (headerValue !== undefined && headersBlackList.indexOf(headerName) === -1) {
                req.setRequestHeader(headerName, headerValue);
            }
        }
    );
    // send the request with a copy the body if it exists
    req.send(request.body || null);

    /*
     * manage the Response to send back
     */
    // set response status
    response.statusCode = req.status;
    // copy response headers
    headers = req.getAllResponseHeaders().trim().split(/\r?\n/);
    headers.forEach(
        function setResponseHeader(header) {
            var
                headerName,
                headerValue;

            header = header.split(':');
            headerName = header[0];
            headerValue = header[1];
            if (headerValue && headersBlackList.indexOf(headerName) === -1) {
                response.headers[headerName] = headerValue;
            }
        }
    );

    // copy response body if it exists
    response.body = req.responseText || null;

}