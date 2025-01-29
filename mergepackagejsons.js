const fs = require("fs");
const OVERRIDE_TEMPLATE_DEPENDENCIES =
  process.env.OVERRIDE_TEMPLATE_DEPENDENCIES || false;

// combines package.jsons and writes them to /tmp/package.json
function mergePackageJsons() {
  const templatePackage = JSON.parse(fs.readFileSync("package.json", "utf8"));

  if (!fs.existsSync("/app/package.json")) {
    fs.writeFileSync(
      "/tmp/package.json",
      JSON.stringify(templatePackage, null, 2)
    );

    // nothing left to do, just use the template package.json
    return;
  }

  const servicePackage = JSON.parse(
    fs.readFileSync("/app/package.json", "utf8")
  );

  warnAboutVersionDifferences(templatePackage, servicePackage);

  if (OVERRIDE_TEMPLATE_DEPENDENCIES) {
    servicePackage.dependencies = {
      ...templatePackage.dependencies,
      ...servicePackage.dependencies,
    };
  } else {
    servicePackage.dependencies = {
      ...servicePackage.dependencies,
      ...templatePackage.dependencies,
    };
  }

  fs.writeFileSync(
    "/tmp/package.json",
    JSON.stringify(servicePackage, null, 2)
  );
}

function warnAboutVersionDifferences(templatePackage, servicePackage) {
  Object.keys(templatePackage.dependencies).forEach((dep) => {
    if (
      servicePackage.dependencies[dep] &&
      templatePackage.dependencies[dep] !== servicePackage.dependencies[dep]
    ) {
      const winner = OVERRIDE_TEMPLATE_DEPENDENCIES ? "service" : "template";
      console.warn(
        `Warning: Dependency ${dep} has different versions in template and service package.json. Using ${winner} version.`
      );
    }
  });
}

mergePackageJsons();
