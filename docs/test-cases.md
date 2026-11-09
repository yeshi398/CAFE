# CST Café – Test Cases

**Owner:** Sonam Yangchen (QA)  
**Jira:** CAFE-9 (test cases), CAFE-10 (local testing), CAFE-18 (live testing)

> Simulated test runs showing how completed results can be recorded. Dates and outcomes are illustrative.

## Local test results – CAFE-10

**Result:** 20 passed, 0 failed, 0 blocked.

| ID | Area | Steps | Expected result | Actual result | Pass/Fail | Tested by / date |
|---|---|---|---|---|---|---|
| TC-01 | Menu | Open /menu | Categories and items load with prices in Nu. | Menu categories and items loaded, with prices displayed in Nu. | Pass | Sonam / 25 October 2026 |
| TC-02 | Menu | Search "momo" | Only momo items shown | Searching for momo showed only matching items. | Pass | Sonam / 25 October 2026 |
| TC-03 | Menu | Look at a sold-out item | "Sold out", no Add button | The item displayed a Sold out label and had no Add button. | Pass | Sonam / 25 October 2026 |
| TC-04 | Cart | Add 2 items, change quantity, remove one | Totals update immediately | The cart total updated immediately after the quantity change and item removal. | Pass | Sonam / 25 October 2026 |
| TC-05 | Checkout | Confirm with empty name | Error "Please enter your name" | Checkout displayed “Please enter your name” and stopped submission. | Pass | Sonam / 25 October 2026 |
| TC-06 | Checkout | Choose Dine-in without a table | Error asks for table number | Checkout prompted for a table number and stopped submission. | Pass | Sonam / 25 October 2026 |
| TC-07 | Checkout | Place a valid takeaway order | Receipt with Order ID CST-YYYYMMDD-NNN, status Unpaid | A receipt showed an order ID in the CST-YYYYMMDD-NNN format and an Unpaid status. | Pass | Sonam / 25 October 2026 |
| TC-08 | Checkout | Double-click Confirm Order | Only ONE order created | Double-clicking Confirm Order produced one order. | Pass | Sonam / 25 October 2026 |
| TC-09 | Receipt | Click Print / Save PDF / Copy ID | Each works | Print and Save PDF opened their respective dialogs, and Copy ID copied the order ID. | Pass | Sonam / 25 October 2026 |
| TC-10 | Tracking | Enter the Order ID on /track-order | Shows "Order Received", Unpaid | The tracking page showed Order Received and Unpaid for the entered order ID. | Pass | Sonam / 25 October 2026 |
| TC-11 | QR | Scan a table QR (e.g. table 5) with a phone | Menu opens with Dine-in · Table 5 | Scanning the table 5 QR code opened the menu with Dine-in and Table 5 selected. | Pass | Sonam / 25 October 2026 |
| TC-12 | Admin | Open /admin/dashboard without logging in | Redirected to login | The admin dashboard redirected to the login page while signed out. | Pass | Sonam / 25 October 2026 |
| TC-13 | Admin | Log in with wrong password | "Incorrect email or password" | The login form displayed “Incorrect email or password” and denied access. | Pass | Sonam / 25 October 2026 |
| TC-14 | Admin | Start preparing → Mark ready on an order | Customer tracking page updates | The tracking page reflected both the Preparing and Ready updates. | Pass | Sonam / 25 October 2026 |
| TC-15 | Admin | Try "Complete" on an unpaid order | Not allowed – must be paid first | The admin view prevented completion while the order was unpaid. | Pass | Sonam / 25 October 2026 |
| TC-16 | Admin | "Paid & collected" | Order Completed + Paid; dashboard sales increase | The order showed Completed and Paid, and the dashboard sales total increased. | Pass | Sonam / 25 October 2026 |
| TC-17 | Admin | Cancel an unpaid order | Status Cancelled; not counted in sales | The order showed Cancelled and was excluded from dashboard sales. | Pass | Sonam / 25 October 2026 |
| TC-18 | Admin | Change an item's price | New orders use new price; old receipts unchanged | New orders used the updated price, and the earlier receipt kept its original price. | Pass | Sonam / 25 October 2026 |
| TC-19 | Admin | Mark an item sold out | Customers can't order it | The item showed Sold out, and the customer could not add it to the cart. | Pass | Sonam / 25 October 2026 |
| TC-20 | Mobile | Repeat TC-01 to TC-07 on a phone | Layout fits the screen, buttons easy to tap | TC-01 through TC-07 worked on a phone. The layout fit the screen and the buttons were easy to tap. | Pass | Sonam / 25 October 2026 |

## Live test results – CAFE-18

**Result:** 20 passed, 0 failed, 0 blocked.

| ID | Area | Steps | Expected result | Actual result | Pass/Fail | Tested by / date |
|---|---|---|---|---|---|---|
| TC-01 | Menu | Open /menu | Categories and items load with prices in Nu. | Menu categories and items loaded, with prices displayed in Nu. | Pass | Sonam / 8 November 2026 |
| TC-02 | Menu | Search "momo" | Only momo items shown | Searching for momo showed only matching items. | Pass | Sonam / 8 November 2026 |
| TC-03 | Menu | Look at a sold-out item | "Sold out", no Add button | The item displayed a Sold out label and had no Add button. | Pass | Sonam / 8 November 2026 |
| TC-04 | Cart | Add 2 items, change quantity, remove one | Totals update immediately | The cart total updated immediately after the quantity change and item removal. | Pass | Sonam / 8 November 2026 |
| TC-05 | Checkout | Confirm with empty name | Error "Please enter your name" | Checkout displayed “Please enter your name” and stopped submission. | Pass | Sonam / 8 November 2026 |
| TC-06 | Checkout | Choose Dine-in without a table | Error asks for table number | Checkout prompted for a table number and stopped submission. | Pass | Sonam / 8 November 2026 |
| TC-07 | Checkout | Place a valid takeaway order | Receipt with Order ID CST-YYYYMMDD-NNN, status Unpaid | A receipt showed an order ID in the CST-YYYYMMDD-NNN format and an Unpaid status. | Pass | Sonam / 8 November 2026 |
| TC-08 | Checkout | Double-click Confirm Order | Only ONE order created | Double-clicking Confirm Order produced one order. | Pass | Sonam / 8 November 2026 |
| TC-09 | Receipt | Click Print / Save PDF / Copy ID | Each works | Print and Save PDF opened their respective dialogs, and Copy ID copied the order ID. | Pass | Sonam / 8 November 2026 |
| TC-10 | Tracking | Enter the Order ID on /track-order | Shows "Order Received", Unpaid | The tracking page showed Order Received and Unpaid for the entered order ID. | Pass | Sonam / 8 November 2026 |
| TC-11 | QR | Scan a table QR (e.g. table 5) with a phone | Menu opens with Dine-in · Table 5 | Scanning the table 5 QR code opened the menu with Dine-in and Table 5 selected. | Pass | Sonam / 8 November 2026 |
| TC-12 | Admin | Open /admin/dashboard without logging in | Redirected to login | The admin dashboard redirected to the login page while signed out. | Pass | Sonam / 8 November 2026 |
| TC-13 | Admin | Log in with wrong password | "Incorrect email or password" | The login form displayed “Incorrect email or password” and denied access. | Pass | Sonam / 8 November 2026 |
| TC-14 | Admin | Start preparing → Mark ready on an order | Customer tracking page updates | The tracking page reflected both the Preparing and Ready updates. | Pass | Sonam / 8 November 2026 |
| TC-15 | Admin | Try "Complete" on an unpaid order | Not allowed – must be paid first | The admin view prevented completion while the order was unpaid. | Pass | Sonam / 8 November 2026 |
| TC-16 | Admin | "Paid & collected" | Order Completed + Paid; dashboard sales increase | The order showed Completed and Paid, and the dashboard sales total increased. | Pass | Sonam / 8 November 2026 |
| TC-17 | Admin | Cancel an unpaid order | Status Cancelled; not counted in sales | The order showed Cancelled and was excluded from dashboard sales. | Pass | Sonam / 8 November 2026 |
| TC-18 | Admin | Change an item's price | New orders use new price; old receipts unchanged | New orders used the updated price, and the earlier receipt kept its original price. | Pass | Sonam / 8 November 2026 |
| TC-19 | Admin | Mark an item sold out | Customers can't order it | The item showed Sold out, and the customer could not add it to the cart. | Pass | Sonam / 8 November 2026 |
| TC-20 | Mobile | Repeat TC-01 to TC-07 on a phone | Layout fits the screen, buttons easy to tap | TC-01 through TC-07 worked on a phone. The layout fit the screen and the buttons were easy to tap. | Pass | Sonam / 8 November 2026 |