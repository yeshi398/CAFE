# CST Café – Sprint Meeting Notes

**Owner:** Sonam Yangchen (Scrum Master)  
**Project period:** 5 October to 10 November 2026  
**Team:** Kelzang Penjor (DevOps), Wangmo (Backend and Jira), Yeshi Wangmo (Frontend), Sonam Yangchen (QA and documentation)

> Retrospective draft written from the six-sprint plan. It assumes the planned work was completed, including the 10 November demo. Check the entries against Jira, GitHub, and the test logs before submitting.

## Sprint 1 – Project setup

**Dates:** 5–11 October 2026  
**Goal:** Set up GitHub, Jira, and database access for the team.

| Member | Work completed |
|---|---|
| Kelzang | **CAFE-1:** Created the GitHub repository, invited the team, and uploaded the starter files. Helped Wangmo connect the repository to Jira. |
| Wangmo | Set up the Jira board and assigned the work. **CAFE-2:** Connected Jira to GitHub with Kelzang. **CAFE-4:** Set up MongoDB access for the team and Render. |
| Yeshi | Accepted the invitations, cloned the repository, and checked the frontend tools. |
| Sonam | Accepted the invitations, cloned the repository, and recorded the sprint plan and setup needs. |

**Sprint review:** The team had a shared Jira board and GitHub repository and could begin uploading its work.  
**Needed next:** The backend, frontend, and documentation pull requests, with reviewers assigned.

## Sprint 2 – Upload and run the project locally

**Dates:** 12–18 October 2026  
**Goal:** Merge the backend, frontend, and documentation and run the website locally.

| Member | Work completed |
|---|---|
| Kelzang | Helped with repository access and reviewed Sonam’s documentation pull request. |
| Wangmo | **CAFE-3:** Uploaded the backend API and automated tests. Reviewed Yeshi’s frontend pull request. |
| Yeshi | **CAFE-5:** Uploaded the frontend and reviewed Wangmo’s backend pull request. **CAFE-6:** Ran the merged website locally and checked each page. |
| Sonam | **CAFE-9:** Uploaded the 20 test cases and sprint meeting notes in `docs/` and requested Kelzang’s review. |

**Sprint review:** The team brought the backend, frontend, and documentation together in one repository. Yeshi checked that the merged site ran locally.  
**Needed next:** Automated checks, test database and admin access, and a full run of the local test cases.

## Sprint 3 – Automatic checks and local testing

**Dates:** 19–25 October 2026  
**Goal:** Add automated checks to pull requests and record local test results.

| Member | Work completed |
|---|---|
| Kelzang | **CAFE-7 and CAFE-8:** Added GitHub Actions workflows for the backend tests and frontend build. |
| Wangmo | Helped Sonam get test database and admin access and investigated backend issues raised during testing. |
| Yeshi | Investigated frontend issues raised during local testing. |
| Sonam | **CAFE-10:** Ran the local test cases, recorded the results, and filed Jira bugs for failures. Assigned backend issues to Wangmo and frontend issues to Yeshi. |

**Sprint review:** The team could see automated check results on pull requests and use the local test log to track issues.  
**Needed next:** Production configuration, deployment access, and a live URL for testing.

## Sprint 4 – Deploy the website

**Dates:** 26 October–1 November 2026  
**Goal:** Publish the website and require reviews and passing checks before merging to `main`.

| Member | Work completed |
|---|---|
| Kelzang | **CAFE-11 and CAFE-12:** Deployed the backend to Render and the frontend to Vercel. **CAFE-13:** Configured branch protection for `main` with pull request reviews and required checks. |
| Wangmo | **CAFE-14:** Configured production secrets, rotated shared passwords, and provided Kelzang with the updated database credentials privately. |
| Yeshi | Checked that the deployed frontend could reach the backend and prepared the menu photos and QR materials. |
| Sonam | Collected the live URL and test access, started the report outline, and gathered Jira, pull request, and GitHub Actions evidence. |

**Sprint review:** The published website was ready for live testing.  
**Needed next:** Test access on a laptop and phone, working QR codes, and time to verify fixes after deployment.

## Sprint 5 – Live testing, fixes, and report

**Dates:** 2–8 November 2026  
**Goal:** Test the live site, verify fixes, and complete the project report.

| Member | Work completed |
|---|---|
| Kelzang | Checked that merged changes redeployed and shared CI/CD evidence for the report. |
| Wangmo | **CAFE-15:** Fixed the backend bugs assigned from testing and handed the fixes back to Sonam for retesting. |
| Yeshi | **CAFE-16:** Added real food photos. **CAFE-17:** Generated the live menu and table QR codes, scanned them with two phones, and prepared them for printing. |
| Sonam | **CAFE-18:** Ran TC-01 through TC-20 on the live site using a laptop and phone. Recorded results and retested fixes after deployment. **CAFE-19:** Completed the project report with the architecture, Jira and GitHub workflow, CI/CD, and test evidence. |

**Sprint review:** The live test log and report documented the project results and the checks performed.  
**Needed next:** Rehearse the customer and admin flows, check the demo devices and login, and prepare a small pull request for the CI/CD demonstration.

## Sprint 6 – Rehearsal and final presentation

**Dates:** 9–10 November 2026  
**Rehearsal:** 9 November 2026  
**Final presentation:** 10 November 2026  
**Goal:** Demonstrate a complete café order and show how a GitHub change reaches the live site.

| Member | Work completed |
|---|---|
| Kelzang | Used a small pull request to show the automated checks, teammate review, merge, and redeployment. |
| Wangmo | Demonstrated the admin view by preparing the order and marking it paid. |
| Yeshi | Scanned a table QR code, placed an order on a phone, and showed the receipt. |
| Sonam | **CAFE-20:** Led the rehearsal and final presentation. Explained the Jira workflow and presented the local and live testing results. |

**Sprint review:** The team demonstrated the customer order, the admin workflow, and how a reviewed change was deployed.  
**Closeout:** Record any remaining issues in Jira and keep the report, test logs, and demo evidence with the project.

## Stand-up record

Copy this block for each meeting and fill it in from the team’s notes.

### Stand-up – [Meeting date and sprint]

**Present:** [Attendees]

| Member | Completed since last meeting | Next step | Blockers |
|---|---|---|---|
| Kelzang | | | |
| Wangmo | | | |
| Yeshi | | | |
| Sonam | | | |

**Decisions and actions:** [Decision, owner, and due date]