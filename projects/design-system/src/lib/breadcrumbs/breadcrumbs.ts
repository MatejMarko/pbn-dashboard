import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { SvgComponent } from '../svg/svg';
import { GhostButton } from '../ds-button/ds-ghost-button/ghost-button';

export interface Breadcrumb {
  label: string;
  path?: string[];
}

@Component({
  selector: 'lib-breadcrumbs',
  imports: [RouterLink, NgTemplateOutlet, SvgComponent, GhostButton],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.scss',
})
export class Breadcrumbs {
  public breadcrumbs = input<Breadcrumb[]>();
}
