/*
 * Sample plugin scaffolding for Adobe XD.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */
const { alert, error } = require("./lib/dialogs.js");
const shell = require("uxp").shell;
var {Rectangle, Color} = require("scenegraph");

function replaceSpaces(string) {
  return string.replace(/ /g,"");
}

function convertTo(format, color) {
    if(format == 'hex')
    {
      return "#" + (color & 0x00FFFFFF).toString(16).padStart(6, '0');
    } 
    else 
    {
      alert('Other color formats not supported yet');
    }
  }

function createResources(fonts, colors, styles)
{
  let stringToCopy = "";

  // copy fonts if they exist
  if (fonts.length > 0)
  {
    stringToCopy += "<!-- Fonts -->\r\n"
    stringToCopy += fonts;
  }

  // copy colors if they exist
  if (colors.length > 0)
  {
    stringToCopy += "<!-- Colors -->\r\n"
    stringToCopy += colors;
  }

  // copy styles if they exist
  if (styles.length > 0)
  {
    if (stringToCopy.length > 0) 
      stringToCopy += "\r\n";
    
    stringToCopy += "<!-- Styles -->\r\n"
    stringToCopy += styles;
  }
  return stringToCopy;
}

function findColorStyle(fillHexColor, colorsCollection) {
    // Loop over all colors in Assets, if the colour we want is defined, reference it
    for (var i = 0; i < colorsCollection.length; i++) 
    {
      // get color hex value
      let newColor = convertTo('hex', colorsCollection[i]['color']['value']);

      if(newColor == fillHexColor)
      {
        // get color name or create one
        var colorName = (colorsCollection[i]['name'] == undefined) ? "Color" + i : colorsCollection[i]['name'];
        colorName = replaceSpaces(colorName);
        let resourceColorName = "{StaticResource " + colorName + "}";
        //isResourceColor = true;
        return resourceColorName;
      }
    }
    return null;
}

function getFontStyles()
{
  var assets = require("assets"),
  allStyles = assets.characterStyles.get();

  let fontCollection = [];
  let fontCollectionIndex = 0;

  for (var i = 0; i < allStyles.length; i++)
  {
    // get the style information
    let charStyle = allStyles[i]['style'];

    let concatFont = charStyle["fontFamily"] + "-" + charStyle["fontStyle"];
    
    let fontDef = "";
    fontDef += "<OnPlatform x:Key=\"" + concatFont + "\" x:TypeArguments=\"x:String\">\r\n"; 
    fontDef += "\t<On Platform=\"Android\" Value=\"" + concatFont + ".ttf#" + concatFont + " />\r\n"; 
    fontDef += "\t<On Platform=\"iOS\" Value=\"" + concatFont + " />\r\n"; 
    fontDef += "</OnPlatform>\r\n"; 

    var found = fontCollection.find(function(element) { 
      return element.resourceKey == concatFont; 
    }); 

    if(!found) {
      fontCollection[fontCollectionIndex++] = {
        resourceKey: concatFont,
        xamarinResourceReference: "{StaticResource " + concatFont + "}",
        xamarinResource: fontDef
      }
    }

    return fontCollection;
  }
}

function getCharacterAssets(fonts)
{
  var assets = require("assets"),
  allStyles = assets.characterStyles.get();

  let allColors = assets.colors.get();

  let styles = "";

  for (var i = 0; i < allStyles.length; i++)
  {
    // get style name or create one
    var styleName = (allStyles[i]['name'] == undefined) ? "Style" + i : allStyles[i]['name'];
    styleName = replaceSpaces(styleName);

    // get the style information
    let charStyle = allStyles[i]['style'];

    let fillHexColor = charStyle["fill"].toHex(true);
    
    let resourceColorName = findColorStyle(fillHexColor, allColors);

    let fontConcat = charStyle["fontFamily"] + "-" + charStyle["fontStyle"];
    let font = fonts.find(function(element) { 
      if(element.resourceKey == fontConcat) {
        return element;
      } 
    });

    // create the style entry
    let styleDef = "";
    styleDef += "<Style x:Key=\"" + styleName + "\" TargetType=\"Label\">\r\n";
    styleDef += "\t<Setter Property=\"FontFamily\" Value=\"" + (font !== null && font !== undefined ? font.xamarinResourceReference : charStyle["fontFamily"]) + "\"/>\r\n"; 
    styleDef += "\t<Setter Property=\"FontSize\" Value=\"" + charStyle["fontSize"] + "\"/>\r\n"; 
    styleDef += "\t<Setter Property=\"TextColor\" Value=\"" + (resourceColorName !== null ? resourceColorName : fillHexColor) + "\"/>\r\n"; 
    styleDef += "</Style>\r\n\r\n";
    
    styles +=styleDef;
  }
  return styles;
}

function getColors() {
    var assets = require("assets"),
    allColors = assets.colors.get();
  
    let colors = "";

    // Loop over all colors in Assets and concetenate to string
    for (var i = 0; i < allColors.length; i++) 
    {
      // get color hex value
      let newColor = convertTo('hex', allColors[i]['color']['value']);

      // get color name or create one
      var colorName = (allColors[i]['name'] == undefined) ? "Color" + i : allColors[i]['name'];
      colorName = replaceSpaces(colorName);

      // create resource string
      colors += "<Color x:Key=\"" + colorName + "\">" + newColor + "</Color>\r\n";
    }
    return colors;
  }


  function getDialog(colors) {
    // Get the dialog if it already exists
    let dialog = document.querySelector("dialog");
  
    if (dialog) {
      return dialog;
    }
  
    // Otherwise, create and return a new dialog
    return createDialog(colors);
  }
  
  function createDialog(colors) {
    document.body.innerHTML = `
      <style>
          form {
              width: 600px;
          }
          .h1 {
            align-items: center;
            justify-content: space-between;
            display: flex;
            flex-direction: row;
        }
        .icon {
            border-radius: 4px;
            width: 24px;
            height: 24px;
            overflow: hidden;
        }
      }
      </style>
      <dialog>
          <form method="dialog">
              <h1></h1>
              <h1 class="h1">
              <span>Xamarin.Forms Exporter</span>
              <img class="icon" src="./images/icon48.png" />
              </h1>
              <hr/>
              <p>Here are the Colors and Character Styles defined in the Assets of your project.</p>
              <textarea id="resources" readonly="true" height=400>` + colors + `</textarea>
              <hr/>
              <p>You can manually copy the resources you need from the text area above, or just hit Copy button below to copy all resources to the clipboard.</p>
              <hr/>            
              <footer>
                  <button id="cancel">Cancel</button>
                  <button type="submit" id="ok" uxp-variant="cta">Copy</button>
              </footer>
          </form>
      </dialog>
    `;
  
    //// Get references to DOM elements
    // Each of these will be used in event handlers below
    const [dialog, form, cancel, ok, resources] = [
      `dialog`,
      `form`,
      "#cancel",
      "#ok",
      "#resources"
    ].map(s => document.querySelector(s));

    //// Add event handlers
    // Close dialog when cancel is clicked.
    // Note that XD handles the ESC key for you, also returning `reasonCanceled`
    cancel.addEventListener("click", () => 
      {
        dialog.close("reasonCanceled");
      });
  
    // Handle ok button click
    ok.addEventListener("click", e => handleSubmit(e, dialog, resources));
    // Handle form submit via return key
    form.onsubmit = e => handleSubmit(e, dialog, resources);
  
    return dialog;
  }

  function handleSubmit(e, dialog, resources) {
    var clipText = resources.value;

    let clipboard = require("clipboard");
    clipboard.copyText(clipText);

    // Close the dialog, passing back data
    dialog.close(resources.value);
    // Prevent further automatic close handlers
    e.preventDefault();
  }

  function fontsToString(fonts) {
    let fontsString = "";
    console.log(fonts);
    for (var i = 0; i < fonts.length; i++) {
      //console.log(fonts[i]);
      console.log(fonts[i].resourceKey);
      console.log(fonts[i].xamarinResource);
      fontsString += fonts[i].xamarinResource;
    }
    return fontsString
  }

async function myPluginCommand(selection) {
  // get the colors and character assets
  var colors = getColors();
  var fontsCollection = getFontStyles();
  var fonts = fontsToString(fontsCollection);
  var styles = getCharacterAssets(fontsCollection);

  if (colors.length == 0 && styles.length==0)
  {
    alert("No Assets", "The plugin could not find any Assets in your project.  Check that you have defined Color and/or Character Style assets in your project.");
  }
  else
  {
    var outputText = createResources(fonts, colors, styles);
    const dialog = getDialog(outputText);
    const result = await dialog.showModal();
    dialog.remove();

    // Exit if the user cancels the modal
    if (result === "reasonCanceled")
    {
      // we actually don't need to do anything here
      //return console.log("User clicked cancel or escape.");
    }
  }
}

module.exports = {
    commands: {
        myPluginCommand: myPluginCommand
    }
};
