import fs from 'fs';

// combines package.jsons and writes them to /tmp/merged-package.json
function mergePackageJson() {
  const templatePackage = JSON.parse(fs.readFileSync("package.json", "utf8"));

  if (fs.existsSync("/app/package.json")) {
    const servicePackage = JSON.parse(
      fs.readFileSync("/app/package.json", "utf8")
    );

    servicePackage.dependencies = servicePackage.dependencies || {};

    servicePackage.dependencies = {
      ...servicePackage.dependencies,
      ...templatePackage.dependencies,
    };

    warnAboutVersionDifferences(templatePackage, servicePackage);

    fs.writeFileSync(
      "/tmp/merged-package.json",
      JSON.stringify(servicePackage, null, 2)
    );
  } else {
    // just use the template package.json
    fs.writeFileSync(
      "/tmp/merged-package.json",
      JSON.stringify(templatePackage, null, 2)
    );
  }
}

function warnAboutVersionDifferences(templatePackage, servicePackage) {
  Object.keys(templatePackage.dependencies).forEach((dep) => {
    if (
      servicePackage.dependencies[dep] &&
      templatePackage.dependencies[dep] !== servicePackage.dependencies[dep]
    ) {
      const winner = "template";
      // QUESTION: Can we cope with compatible definitions?
      console.warn(
        `Warning: Dependency ${dep} has different versions in template and service package.json. Using ${winner} version.`
      );
    }
  });
}

mergePackageJson();
