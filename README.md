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

2. Copy **assets/CenitIO** folder to **assets** folder in you application.

3. Add **Select2** and **CenitIO** components before close html tag and after include **app.min.js** in the 
   html application file **combochartex.htm** as this snippet code:
 
```html
<html manifest="offline.appcache">
  <!-- ORIGINAL CODE SECTION -->
</body>
  <script type="text/javascript" src="assets/js/app.min.js"></script>
  
  <!-- Components to integration with CenitIO -->
  
<link type="text/css" rel="stylesheet" href="assets/CenitIO/css/select2.min.css"/>
<link type="text/css" rel="stylesheet" href="assets/CenitIO/css/main.css"/>

<script type="text/javascript" src="assets/CenitIO/js/select2.min.js"></script>
<script type="text/javascript" src="assets/CenitIO/js/Config.js"></script>
<script type="text/javascript" src="assets/CenitIO/js/Controller.js"></script>
</html>
```
 
4. Setting CenitIO connection parameters in to **assets/js/Config.js**. As this snippet code:

```javascript
  var CenitIO = {
      baseApiUrl: "https://cenit.io/api/v2",
      dtName: "combobox_test",
      dtNamespace: "DataService",
      dtNamespaceSlug: null,
      token: null
  };
```

#### Parameters description:

* **baseApiUrl:**       (REQUIRED) Base URL to CenitIO API.
* **dtName:**           (REQUIRED) Data type name.
* **dtNamespace:**      (REQUIRED) Data type namespace.
* **dtNamespaceSlug:**  (OPTIONAL) Data type namespace slug. If dtNamespaceSlug value is undefined, null or false, 
                                   then will be requested in the submit action.
* **token:**            (OPTIONAL) Authorisation token. If token value is undefined, null or false, then will be 
                                   prompted in the submit action.
                                  
### Get authorisation token from CenitIO:

...

### Conclusion

You are done now, you have configured the SpreadsheetConverter offline cache calculator app to your CenitIO Tenant 
to persist your form.

Open this in your web browser and you are good to go!

Just hit the Submit button on webpage to test it out!
