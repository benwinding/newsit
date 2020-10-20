const del = require("del");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const jsonTransform = require("gulp-json-transform");
const rename = require("gulp-rename");
const zip = require("gulp-zip");

const target = process.env.TARGET || "chrome";
const version = process.env.npm_package_version;
const isProduction = process.env.IS_PRODUCTION || false;

console.log("       VERSION=" + version);
console.log("        TARGET=" + target);
console.log(" IS_PRODUCTION=" + isProduction);

function getDevVersion() {
  const versionPatch = parseInt((parseInt(new Date().getTime() / 1000) - 1603194242)/20);
  const version = '1.2.' + versionPatch;
  return version;
}

const conf = {
  vendorPaths: [
    "./node_modules/jquery/dist/jquery.min.js",
    "./node_modules/bulma/css/bulma.min.css",
    "./node_modules/vue/dist/vue.min.js",
    "./node_modules/react/umd/react.development.js",
    "./node_modules/react-dom/umd/react-dom.development.js",
  ],
  src: {
    core: ["./src/js/shared/core.js"],
    scripts: ["./src/js/**/*.js"],
    html: ["./src/**/*.html"],
    css: ["./src/css/*.css"],
    images: "./src/img/**/*",
    manifest: `./src/manifest-${target}.json`,
  },
  webpack: {
    build: "./build/webpack/**/*.js",
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
            version: isProduction ? process.env.npm_package_version : getDevVersion(),
            ...data,
          },
          null,
          2
        );
      })
    )
    .pipe(gulp.dest(conf.output.dir));
});

gulp.task("vendor", function () {
  return gulp
    .src(conf.vendorPaths)
    .pipe(gulp.dest(conf.output.dir + "/vendor"));
});

gulp.task("copy-webpack-build", function () {
  return gulp.src(conf.webpack.build).pipe(gulp.dest(conf.output.dir + "/js"));
});

gulp.task(
  "copy-code",
  gulp.series("copy-webpack-build", [
    "html",
    "images",
    "manifest",
    "vendor",
    "css",
  ])
);

gulp.task(
  "watch",
  gulp.series("copy-code", function () {
    gulp.watch(conf.src.html, gulp.series("html"));
    gulp.watch(conf.src.css, gulp.series("css"));
    gulp.watch(conf.src.images, gulp.series("images"));
    gulp.watch(conf.src.manifest, gulp.series("manifest"));
    gulp.watch(conf.webpack.build, gulp.series("copy-webpack-build"));
  })
);

gulp.task("zip", function () {
  return gulp
    .src(conf.output.dir + "/**/*")
    .pipe(zip(conf.output.zipFile))
    .pipe(gulp.dest("./"));
});

gulp.task("build", gulp.series("clean", "copy-code", "zip"));

gulp.task("default", gulp.series("build"));
