const fs = require("fs");
const path = require("path");

const ICON_DIR = "img";
const OUTPUT_FILE = "icons.json";

const LIB_NAME = "ChillAura 图标库";
const LIB_DESCRIPTION = "ChillAura804 自用图标库，自动生成";

const IMAGE_EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg"
]);

const repo = process.env.GITHUB_REPOSITORY || "ChillAura804/icons";
const branch = process.env.GITHUB_REF_NAME || "main";

function encodePath(filePath) {
  return filePath
    .split("/")
    .map(part => encodeURIComponent(part))
    .join("/");
}

function getFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const result = [];

  for (const item of fs.readdirSync(dir)) {
    if (item.startsWith(".")) {
      continue;
    }

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      result.push(...getFiles(fullPath));
      continue;
    }

    const ext = path.extname(item).toLowerCase();

    if (!IMAGE_EXTS.has(ext)) {
      continue;
    }

    result.push(fullPath.replace(/\\/g, "/"));
  }

  return result;
}

const files = getFiles(ICON_DIR).sort((a, b) => {
  return a.localeCompare(b, "zh-Hans-CN", {
    numeric: true,
    sensitivity: "base"
  });
});

const icons = files.map(file => {
  const name = path.basename(file, path.extname(file));

  return {
    name,
    url: `https://raw.githubusercontent.com/${repo}/${branch}/${encodePath(file)}`
  };
});

const json = {
  name: LIB_NAME,
  description: `${LIB_DESCRIPTION}，图标数量：${icons.length}`,
  icons
};

fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(json, null, 2) + "\n",
  "utf8"
);

console.log(`Generated ${OUTPUT_FILE}, icons: ${icons.length}`);
