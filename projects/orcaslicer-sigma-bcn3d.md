---
layout: page
title: "BCN3D Sigma profiles for OrcaSlicer"
description: "Community printer and print profiles for BCN3D Sigma, R17, R18 and R19, configured for OrcaSlicer."
permalink: /projects/orcaslicer-sigma-bcn3d/
github_project: true
lang: en
translation_url: /projects/orcaslicer-sigma-bcn3d-es/
repository: ogrgijon/ORCASLICER_SIGMA_BCN3D
language: 3D printing profiles
project_visual: "https://raw.githubusercontent.com/ogrgijon/ORCASLICER_SIGMA_BCN3D/main/BCN3D_SIGMA_ORCA_PROFILE/V.2.05/BCN3D/BCN3D%20Sigma%20R18_cover.png"
project_visual_alt: "BCN3D Sigma 3D printer"
project_visual_caption: "Image of a BCN3D Sigma printer included in the project README."
---

# BCN3D, Sigma and OrcaSlicer

BCN3D is a Barcelona-based 3D printer manufacturer known for its filament-based machines. The Sigma family consists of desktop printers using FFF (fused filament fabrication) technology and an independent dual-extrusion system, commonly known as IDEX. With two independently operating print heads, these machines can, depending on the model and setup, print with two materials or colours and perform duplication or mirror-mode jobs.

Sigma, R17, R18 and R19 are different versions in the family; their profiles should not be assumed interchangeable without checking the specific machine revision and setup. This community repository provides profiles for these models, with 0.4 mm nozzle configurations, several quality levels, and generic PLA, ABS and PETG materials.

## What does OrcaSlicer do?

OrcaSlicer is a slicer for FFF/FDM printers. It converts a 3D model into layers and generates G-code instructions for the printer. It does this by combining three kinds of settings:

- **Printer:** model, build volume, extruders, nozzle and machine parameters.
- **Filament:** material type and settings such as temperature and cooling.
- **Print process:** layer height, perimeters, infill, supports and speed, among others.

The profiles in this repository provide a starting point for Sigma printers; they do not replace checking the specific machine, filament and printing conditions.

## Install and select the profiles

1. Download the ZIP using **Code → Download ZIP** on GitHub and extract it.
2. In `BCN3D_SIGMA_ORCA_PROFILE`, open the edition you want to use. The current edition listed in the repository is `V.2.05`.
3. Copy the entire contents of that edition folder into `resources\profiles` in your OrcaSlicer installation. On Windows, the usual location is `C:\Program Files\OrcaSlicer\resources\profiles`; it may differ if you installed the program elsewhere.
4. Restart OrcaSlicer so it loads the profiles. Select the exact Sigma variant (including its revision), the compatible nozzle profile, and the filament you plan to use.
5. Choose a print process based on the quality and time you need. The current edition includes Extra Fine (0.06 mm), Fine (0.10 mm), Normal (0.15 mm) and Draft (0.20 mm).
6. Import or place the model, check its orientation, supports and layer preview. Before printing, confirm that temperatures and other settings suit your filament and that the G-code is intended for your printer.

Editions are kept separately: check the repository history to choose a compatible edition, and do not mix files from different versions. The [official OrcaSlicer wiki](https://www.orcaslicer.com/wiki/) explains printer, filament and print-process settings in more detail.

## Scope and cautions

The repository contains OrcaSlicer configuration files; it does not include or modify printer firmware. It is a community project and is not officially affiliated with or endorsed by BCN3D. Profiles are provided as-is: check that they match your model, revision, nozzle and material, and validate settings before use. Supervise initial prints; unsuitable settings can cause print failures or damage.

## Experimental project

These profiles are part of an experimental project and have been tested on a BCN3D Sigma printer running the latest firmware published by BCN3D. That test applies to one specific setup; it does not guarantee the same results on every Sigma unit or revision, with every material, or under all printing conditions. Always verify compatibility and supervise initial test prints.

