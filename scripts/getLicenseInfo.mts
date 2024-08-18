/*
  Copyright (c) 2024 kokuchi.party

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
  OR OTHER DEALINGS IN THE SOFTWARE.
*/

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import checker from "license-checker-rseidelsohn";
import parse from "spdx-expression-parse";
import licensesMap from "spdx-license-list";

import { type LicenseExpr, type Licenses } from "../src/data/licenses.json";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputFile = path.join(__dirname, "..", "src", "data", "licenses.json");
const output: Licenses = {
  packages: {},
  licenses: {}
};

export function isLicense(x: parse.Info): x is parse.LicenseInfo {
  return Object.keys(x).includes("license");
}

export function isConjunction(x: parse.Info): x is parse.ConjunctionInfo {
  return Object.keys(x).includes("conjunction");
}

function getInfo(licenses: string | string[]): parse.Info {
  if (typeof licenses === "string") return parse(licenses.replace("*", ""));
  const xs = licenses.map((license) => parse(license.replace("*", "")));
  return xs.reduce((expr, item) => ({ conjunction: "and", left: expr, right: item }));
}

function unroll(conj: string, expr: LicenseExpr): [LicenseExpr, ...LicenseExpr[]] {
  if (typeof expr === "string") return [expr];
  const [conjunction, ...rest] = expr;
  if (conjunction === conj) return rest;
  else return [expr];
}

function infoToExpr(info: parse.Info): LicenseExpr {
  if (isLicense(info)) return info.license;
  if (isConjunction(info)) {
    const left = infoToExpr(info.left);
    const right = infoToExpr(info.right);

    return [
      info.conjunction,
      ...unroll(info.conjunction, left),
      ...unroll(info.conjunction, right)
    ];
  }
  throw new Error("Invalid info");
}

function addLicense(expr: LicenseExpr) {
  if (!expr) return;
  if (typeof expr === "string") {
    const info = licensesMap[expr];
    if (!info) return;
    output.licenses[expr] = info;
    return;
  }
  const [, ...rest] = expr;
  rest.forEach(addLicense);
}

checker.init(
  {
    start: path.join(__dirname, ".."),
    excludePrivatePackages: true,
    direct: 0
  },
  (err, packages) => {
    if (err) {
      console.error(err);
      return;
    }

    for (const [name, value] of Object.entries(packages)) {
      const { licenses, repository } = value;
      if (!licenses || !repository) continue;

      const expr = infoToExpr(getInfo(licenses));
      output.packages[name] = {
        repository,
        license: expr
      };
      addLicense(expr);
    }

    fs.writeFileSync(outputFile, JSON.stringify(output, undefined, 2));
  }
);
