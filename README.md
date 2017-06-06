# SpreadsheetConverter jQuery adaptor for CenitIO

[![N|Solid](http://www.spreadsheetconverter.com/wp-content/uploads/2013/08/logo.png)](http://www.spreadsheetconverter.com)

CenitSpreadsheetConverter is a helper module for SpreadsheetConverter HTML calculator app to save your form submissions into 
your [CenitIO Tenant](https://cenit.io/). With a small code manipulation inside the calculator app, you can easily connect 
your form to your CenitIO Tenant.

### Installation and Usage

1. Download the component from githup [cenit-io/cenit-spreadsheet-converter-vhtml](https://githup.com/cenit-io/cenit-spreadsheet-converter-vhtml) repository.

```sh
git clone cenit-io/cenit-spreadsheet-converter-vhtml
```

2. Copy **assets/js/jquery-3.2.1.min.js** and **assets/js/CenitIO.js** to **assets/js** folder in you application.

3. Add **jQuery v3.2.1** to head section and **CenitIO.js** connection before close html tag and after include **app.min.js** 
in the html application file **combochartex.htm** as this snippet code:
 
```html
<html manifest="offline.appcache">
<head>
  <!-- ORIGINAL CODE SECTION -->
  <script type="text/javascript" src="assets/js/jquery-3.2.1.min.js"></script>
</head>
<body>
  <!-- ORIGINAL CODE SECTION -->
</body>
  <script type="text/javascript" src="assets/js/app.min.js"></script>
  <script type="text/javascript" src="assets/js/CenitIO.js"></script>
</html>
```
 
4. Setting CenitIO connection parameters in to **assets/js/CenitIO.js**. As this snippet code:

```javascript
    var CenitIO = {

        baseApiUrl: "https://cenit.io/api/v2",
        dataTypeName: "combobox_test",
        dataTypeNamespace: "Services",
        userAccessKey: "**********",
        userAccessToken: "********************",
     
        // .... //
     }
```

You are done now, you have configured the SpreadsheetConverter offline cache calculator app to your CenitIO Tenant 
to persist your form.

Open this in your web browser and you are good to go!

Just hit the Submit button on webpage to test it out!
