# Security Policy

## Supported Versions

Only the latest version on the `main` branch is actively maintained and receives security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, **please do not open a public GitHub issue**.

Instead, report it privately via one of the following methods:

- **GitHub Security Advisories**: Use the [Report a vulnerability](../../security/advisories/new) button on the Security tab of this repository.
- **Email**: Contact the maintainer by opening a [GitHub Security Advisory](../../security/advisories/new) or via the contact method in their [GitHub profile](https://github.com/lpazpinto).

### What to include in your report

- A clear description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept or exploit code if available)
- Any suggested mitigations or fixes

### Response timeline

- We aim to acknowledge your report within **3 business days**.
- We will investigate and provide a resolution timeline within **14 days**.
- We will notify you when the vulnerability has been fixed.

## Scope

This security policy applies to code in this repository. It does not cover third-party dependencies (please report those to the respective upstream projects).

## Security Hardening

This repository uses the following security controls:

- [OpenSSF Scorecard](https://securityscorecards.dev/) automated weekly analysis
- [CodeQL](https://codeql.github.com/) static analysis on every PR and weekly schedule
- [Dependabot](https://docs.github.com/en/code-security/dependabot) for automated dependency updates
- Least-privilege permissions on all GitHub Actions workflows
- Actions pinned to commit SHAs to prevent supply-chain attacks
