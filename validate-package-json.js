import fs from 'fs';

function verifyMergedPackageJson() {
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

verifyMergedPackageJson();
