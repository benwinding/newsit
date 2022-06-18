const del = require("del");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const jsonTransform = require("gulp-json-transform");
const rename = require("gulp-rename");
const zip = require("gulp-zip");
const path = require("path");

const target = process.env.TARGET || "chrome";
const version = process.env.npm_package_version;
const isProduction = process.env.IS_PRODUCTION || false;

console.log("       VERSION=" + version);
console.log("        TARGET=" + target);
console.log(" IS_PRODUCTION=" + isProduction);

function getDevVersion() {
  const versionPatch = parseInt(
    (parseInt(new Date().getTime() / 1000) - 1603194242) / 20
  );
  const version = "1.2." + versionPatch;
  return version;
}

const conf = {
  copyPaths: {
    "./node_modules/webextension-polyfill/dist/browser-polyfill.min.js": "vendor/browser-polyfill.min.js",
    "./node_modules/bulma/css/bulma.min.css": "vendor/bulma.min.css",
    "./node_modules/react/umd/react.production.min.js": "vendor/react.min.js",
    "./node_modules/react-dom/umd/react-dom.production.min.js": "vendor/react-dom.min.js",
    "./node_modules/dompurify/dist/purify.min.js": "vendor/purify.min.js",
    "./src/background-wrapper.js": "background-wrapper.js",
  },
  src: {
    html: ["./src/**/*.html"],
    css: ["./src/css/*.css"],
    images: "./src/img/**/*",
    manifest: `./src/manifest-${target}.json`,
  },
  webpack: {
    build: "./build/webpack/**/*",
  },
  output: {
    dir: `./build/${target}`,
    zipFile: `./build-${target}-${version}.zip`,
  },
};

gulp.task("clean", function () {
  return del([conf.output.dir]);
});

gulp.task("images", function () {
  return gulp
    .src(conf.src.images)
    .pipe(
      imagemin({
        optimizationLevel: 5,
      })
    )
    .pipe(gulp.dest(conf.output.dir + "/img"));
});

gulp.task("html", function () {
  return gulp.src(conf.src.html).pipe(gulp.dest(conf.output.dir));
});

gulp.task("css", function () {
  return gulp.src(conf.src.css).pipe(gulp.dest(conf.output.dir + "/css"));
});

gulp.task("manifest", function () {
  return gulp
    .src(conf.src.manifest)
    .pipe(rename("manifest.json"))
    .pipe(
      jsonTransform(function (data, file) {
        return JSON.stringify(
          {
            description: process.env.npm_package_description,
            version: isProduction
              ? process.env.npm_package_version
              : getDevVersion(),
            ...data,
          },
          null,
          2
        );
      })
    )
    .pipe(gulp.dest(conf.output.dir));
});

gulp.task("copyPaths", function () {
  const srcPaths = Object.keys(conf.copyPaths);
  const copyPathsMap = Object.entries(conf.copyPaths).reduce(
    (acc, [key, val]) => {
      acc[path.basename(key)] = val;
      return acc;
    },
    {}
  );
  return gulp
    .src(srcPaths)
    .pipe(
      rename(function (p) {
        const fullPath = p.basename + p.extname;
        const newFileName = copyPathsMap[fullPath];
        p.basename = newFileName.split('.').slice(0, -1).join('.');
      })
    )
    .pipe(gulp.dest(conf.output.dir));
});

gulp.task("copy-webpack-build", function () {
  return gulp.src(conf.webpack.build).pipe(gulp.dest(conf.output.dir + "/js"));
});

var { exec } = require("child_process");
gulp.task("webpack-compile-watch", function (done) {
  var proc = exec("npm run watch-webpack");
  proc.stdout.on("data", function (data) {
    console.log(data);
  });
});

gulp.task(
  "copy-code",
  gulp.series("copy-webpack-build", [
    "html",
    "images",
    "manifest",
    "copyPaths",
    "css",
  ])
);

gulp.task(
  "watch-and-copy",
  gulp.series("copy-code", function (done) {
    gulp.watch(conf.src.html, gulp.series("html"));
    gulp.watch(conf.src.css, gulp.series("css"));
    gulp.watch(conf.src.images, gulp.series("images"));
    gulp.watch(conf.src.manifest, gulp.series("manifest"));
    gulp.watch(conf.webpack.build, gulp.series("copy-webpack-build"));
  })
);

gulp.task("watch", gulp.parallel("webpack-compile-watch", "watch-and-copy"));

gulp.task("zip", function () {
  return gulp
    .src(conf.output.dir + "/**/*")
    .pipe(zip(conf.output.zipFile))
    .pipe(gulp.dest("./"));
});

gulp.task("build", gulp.series("clean", "copy-code", "zip"));

gulp.task("default", gulp.series("build"));
