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
 
4. Setting CenitIO connection parameters in to **assets/CenitIO/js/Config.js**. As this snippet code:

```javascript
  var CenitIO = {
      baseApiUrl: "https://cenit.io/api/v2",
      dtName: "combobox_test",
      dtNamespace: "DataService",
      dtNamespaceSlug: null,
      token: null,
      
      selectionItems: {                           
          field_id_1: { 
              remote: {
                  apiService: "data_service/data1",
                  rField: "data1s",
                  vField: "id",
                  lField: "name"
              }
          },
          field_id_2: {
              options: [                          
                  { value: 1, label: 'A' },
                  { value: 2, label: 'B' },
                  { value: 3, label: 'C' },
              ]
          },
          field_id_3: {
              options: ['yes', 'no']
          }
      }
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
                                  
* **selectionItems:**   (OPTIONAL) Configuration of items that will be transformed in select box components. The name of 
                                   each element setting must be the value of the id attribute of the field in the form.
                                   The value can be the configuration to obtain the options from a remote service of 
                                   CenitIO or it can be the list of options.
                                   
* **options:**          (OPTIONAL) List (array) of static options. Each option can be an object if value is different to 
                                   label such as ``{ value: '1', label: 'A' }``, or a single value if it is equal to label.
                                   
* **remote:**           (OPTIONAL) Configuration to obtain the options from a remote service of CenitIO.

* **apiService:**       (REQUIRED) Url to REST API service in CenitIO. It is (Namespace slug/Model slug).
* **rField:**           (REQUIRED) Attribute name that contain the records. Usually it is the resource name pluralization.
* **vField:**           (REQUIRED) Record attribute use to get option value.
* **lField:**           (REQUIRED) Record attribute use to get option label.
                             
                             
### Get authorisation token from CenitIO:

1. Define the CenitIO [application](https://cenit.io/application) that will contain the authorizations. 

    **Example values:**

        Namespace: DataService
        
        Name: SpreadsheetFormData

2. Define the OAuth2 [authorization](https://cenit.io/oauth2_authorization) that will contain the authorizations scopes. 

   **Example values:**

        Namespace: DataService
        
        Name: SpreadsheetFormData
        
        Client: DataService | SpreadsheetFormData [App]
        
        Scopes: Cenit | OAuth [Build-In] | {{scope}} [Build-In]
        
        Template parameters: 
        
            Name: scope 
            
            Value: create read

3. Generate token using the **Authorize** action.

4. Copy the **Access token** and set it in **assets/CenitIO/js/Config.js** of SpreadsheetConverter jQuery adaptor.

**Note:** This token will be available for only one hour. After this time you need repeat step 3 and 4.

### Conclusion

You are done now, you have configured the SpreadsheetConverter offline cache calculator app to your CenitIO Tenant 
to persist your form.

Open this in your web browser and you are good to go!

Just hit the Submit button on webpage to test it out!
