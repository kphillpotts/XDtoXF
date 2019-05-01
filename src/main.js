/*
 * Sample plugin scaffolding for Adobe XD.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */
const { alert, error } = require("./lib/dialogs.js");
const shell = require("uxp").shell;
var {Rectangle, Color} = require("scenegraph");

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

function createResources(colors, styles)
{
  let stringToCopy = "";

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

function getCharacterAssets()
{
  var assets = require("assets"),
  allStyles = assets.characterStyles.get();

  let styles = "";

  for (var i = 0; i < allStyles.length; i++)
  {
    // get style name or create one
    let styleName = (allStyles[i]['name'] == undefined) ? "Style" + i : allStyles[i]['name'];

    // get the style information
    let charStyle = allStyles[i]['style'];

    // create the style entry
    let styleDef = "";
    styleDef += "<Style x:Key=\"" + styleName + "\" TargetType=\"Label\">\r\n";
    styleDef += "\t<Setter Property=\"FontFamily\" Value=\"" + charStyle["fontFamily"] + "\"/>\r\n"; 
    styleDef += "\t<Setter Property=\"FontSize\" Value=\"" + charStyle["fontSize"] + "\"/>\r\n"; 
    styleDef += "\t<Setter Property=\"TextColor\" Value=\"" + charStyle["fill"].toHex(true) + "\"/>\r\n"; 
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
      let colorName = (allColors[i]['name'] == undefined) ? "Color" + i : allColors[i]['name'];

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
              <textarea id="resources" readonly="true" value='` + colors + `' height=400></textarea>
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

async function myPluginCommand(selection) {
  // get the colors and character assets
  var colors = getColors();
  var styles = getCharacterAssets();

  if (colors.length == 0 && styles.length==0)
  {
    alert("No Assets", "The plugin could not find any Assets in your project.  Check that you have defined Color and/or Character Style assets in your project.");
  }
  else
  {
    var outputText = createResources(colors, styles);
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
