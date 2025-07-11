const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// File paths
const manifestPath = path.join(__dirname, 'AbsencePlanning', 'ControlManifest.Input.xml');
const solutionPath = path.join(__dirname, 'AbsencePlanningComponentSolution', 'src', 'Other', 'Solution.xml');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

// Helper to increment version (last segment)
function incrementVersion(version) {
  const parts = version.split('.');
  if (parts.length < 3) {
    // If version doesn't have 4 parts, pad with zeros
    while (parts.length < 3) {
      parts.push('0');
    }
  }
  parts[parts.length - 1] = (parseInt(parts[parts.length - 1]) + 1).toString();
  return parts.join('.');
}

// Update XML file with new version
function updateXmlVersion(filePath, updateFunction) {
  console.log(`\n=== Processing ${path.basename(filePath)} ===`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const xmlContent = fs.readFileSync(filePath, 'utf-8');
  
  parser.parseString(xmlContent, (err, result) => {
    if (err) {
      console.error(`Error parsing XML in ${filePath}:`, err);
      return;
    }

    try {
      const currentVersion = updateFunction(result);
      if (!currentVersion) {
        console.error(`Could not find version in ${filePath}`);
        return;
      }

      const newVersion = incrementVersion(currentVersion);
      updateFunction(result, newVersion); // Update the version
      
      const updatedXml = builder.buildObject(result);
      fs.writeFileSync(filePath, updatedXml);
      console.log(`Updated ${path.basename(filePath)} from ${currentVersion} to ${newVersion}`);
      
    } catch (error) {
      console.error(`Error updating version in ${filePath}:`, error);
    }
  });
}

// Main execution
console.log('Manifest path:', manifestPath);
console.log('Solution path:', solutionPath);

// Update ControlManifest.Input.xml
// Based on your XML: <manifest><control version="1.2.3">
updateXmlVersion(manifestPath, (result, newVersion) => {
  if (newVersion) {
    // Set the new version
    result.manifest.control[0].$.version = newVersion;
    return newVersion;
  } else {
    // Get the current version
    return result.manifest.control[0].$.version;
  }
});

// Update Solution.xml  
// Based on your XML: <ImportExportXml><SolutionManifest><Version>1.2.4</Version>
updateXmlVersion(solutionPath, (result, newVersion) => {
  if (newVersion) {
    // Set the new version
    result.ImportExportXml.SolutionManifest[0].Version[0] = newVersion;
    return newVersion;
  } else {
    // Get the current version
    return result.ImportExportXml.SolutionManifest[0].Version[0];
  }
});