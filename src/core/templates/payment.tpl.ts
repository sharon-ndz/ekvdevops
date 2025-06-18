export default `<!doctype html>
<html>

<head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>{{header}}</title>
    <style>
        /* -------------------------------------
        GLOBAL RESETS
        ------------------------------------- */

        img {
            border: none;
            -ms-interpolation-mode: bicubic;
            max-width: 100%;
        }

        body {
            background-color: #f5f5f5;
            font-family: sans-serif;
            -webkit-font-smoothing: antialiased;
            font-size: 14px;
            line-height: 1.4;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }


        table {
            border-collapse: separate;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            width: 100%;
        }

        table td {
            font-family: sans-serif;
            font-size: 14px;
            vertical-align: top;
        }

        /* -------------------------------------
        BODY & CONTAINER
        ------------------------------------- */

        .body {
            background-color: #f5f5f5;
            width: 100%;
        }

        /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */



        /* -------------------------------------
        HEADER, FOOTER, MAIN, DISCLAIMER
        ------------------------------------- */


        .wrapper {
            box-sizing: border-box;
            padding: 20px;
        }

        .warningmsg {
            clear: both;
            padding-top: 10px;
            text-align: center;
            width: 100%;
        }

        .warningmsg p,
        .warningmsg span {
            color: #999999;
            font-size: 12px;
        }

        .warningmsg a {
            color: #757373;
            font-size: 12px;
        }


        /* -------------------------------------
        TYPOGRAPHY
        ------------------------------------- */

        h1,
        h2,
        h3,
        h4 {
            color: #000000;
            font-family: sans-serif;
            font-weight: 400;
            line-height: 1.4;
            margin: 0;
            Margin-bottom: 30px;
        }

        h1 {
            font-size: 35px;
            font-weight: 300;
            text-align: center;
            text-transform: capitalize;
        }

        p,
        ul,
        ol {
            font-family: sans-serif;
            font-size: 14px;
            font-weight: normal;
            margin: 0;
            Margin-bottom: 15px;
        }

        p li,
        ul li,
        ol li {
            list-style-position: inside;
            margin-left: 5px;
        }

        a {
            color: #3498db;
            text-decoration: underline;
        }

        /* -------------------------------------
        BUTTONS
        ------------------------------------- */

        .btn {
            box-sizing: border-box;
            width: 100%;
        }

        .btn>tbody>tr>td {
            padding-bottom: 15px;
        }

        .btn table {
            width: auto;
        }

        .btn table td {
            background-color: #ffffff;
            border-radius: 5px;
            text-align: center;
        }

        .btn a {
            background-color: #ffffff;
            border: solid 1px #3498db;
            border-radius: 5px;
            box-sizing: border-box;
            color: #3498db;
            cursor: pointer;
            display: inline-block;
            font-size: 14px;
            font-weight: bold;
            margin: 0;
            padding: 12px 25px;
            text-decoration: none;
            text-transform: capitalize;
        }

        .btn-primary table td {
            background-color: #3498db;
        }

        .btn-primary a {
            background-color: #3498db;
            border-color: #3498db;
            color: #ffffff;
        }

        /* -------------------------------------
        OTHER STYLES THAT MIGHT BE USEFUL
        ------------------------------------- */

        .last {
            margin-bottom: 0;
        }

        .first {
            margin-top: 0;
        }

        .align-center {
            text-align: center;
        }

        .align-right {
            text-align: right;
        }

        .align-left {
            text-align: left;
        }

        .clear {
            clear: both;
        }

        .mt0 {
            margin-top: 0;
        }

        .mb0 {
            margin-bottom: 0;
        }

        .powered-by a {
            text-decoration: none;
        }

        phone {
            content: "\f437";
        }

        hr {
            border: 0;
            border-bottom: 1px solid #f6f6f6;
            Margin: 20px 0;
        }

        /* -------------------------------------
        RESPONSIVE AND MOBILE FRIENDLY STYLES
        ------------------------------------- */
    </style>
</head>

<body style="overflow-x:hidden">

    <table border="0" cellpadding="0" cellspacing="0" class="body">
        <tr>
            <td>&nbsp;</td>
            <td
                style="display: block;margin: 0 auto !important;max-width: 580px;padding: 0;width: auto !important;width: 100%;">
                <div>
                    <!-- START CENTERED WHITE CONTAINER -->
                    <span
                        style="color: transparent;display: none;height: 0;max-height: 0;max-width: 0;opacity: 0;overflow: hidden;mso-hide: all;visibility: hidden;width: 0;">{{header}}</span>
                    <table style="background: #f5f5f5;border-radius: 3px;width: 100%;">
                        <!-- START MAIN CONTENT AREA -->
                        <tr>
                            <td style="box-sizing: border-box;padding: 10px;">
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <div
                                                style="font-family: Arial, sans-serif;margin: 0;padding: 0;display: flex;justify-content: center;align-items: center;min-width: 330px;">
                                                <div
                                                    style="background-color: #fff;border-radius: 8px;box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);padding: 20px;max-width: 380px;width: 100%;">
                                                    <div style="text-align: center;padding-bottom: 10px;">
                                                        <table style="width: 100%;">
                                                            <tr>
                                                                <th style="text-align: right;">
                                                                    Transaction Receipt
                                                                </th>
                                                            </tr>
                                                        </table>
                                                        <p
                                                            style="margin: 0;color: #4CAF50;font-size: 18px;font-weight: bold;">
                                                            {{currency}}{{amount}}</p>
                                                        <p style="font-weight: 600;font-size: small;color: #504d4d">
                                                            Successful</p>
                                                        <p style="font-weight: 600;font-size: small;color: #504d4d">
                                                            {{date}}</p>
                                                    </div>
                                                    <span
                                                        style="border-bottom: 2px dotted #6a6767; display: inline-block; height: 1px; width: 100%;"></span>
                                                    <div style="padding: 10px 0;">

                                                        <table style="width: 100%;">
                                                            <tr>
                                                                <th
                                                                    style="text-align: left;line-height: 2.5;font-weight: bold;color: #6a6767;font-size: small;">
                                                                    Transaction type:
                                                                </th>
                                                                <th
                                                                    style="text-align: right;line-height: 2.5;font-weight: 500;color: #5b5b5b;font-size: small;">
                                                                    {{transactionType}}
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <th
                                                                    style="text-align: left;line-height: 2.5;font-weight: bold;color: #6a6767;font-size: small;">
                                                                    Recipient Details:
                                                                </th>
                                                                <th
                                                                    style="text-align: right;line-height: 2.5;font-weight: 500;color: #5b5b5b;font-size: small;">
                                                                    VitalReg NPC
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <th
                                                                    style="text-align: left;line-height: 2.5;font-weight: bold;color: #6a6767;font-size: small;">
                                                                    Sender Details:
                                                                </th>
                                                                <th
                                                                    style="text-align: right;line-height: 2.5;font-weight: 500;color: #5b5b5b;font-size: small;">
                                                                    {{payee}}
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <th
                                                                    style="text-align: left;line-height: 2.5;font-weight: bold;color: #6a6767;font-size: small;">
                                                                    Transaction ID:
                                                                </th>
                                                                <th
                                                                    style="text-align: right;line-height: 2.5;font-weight: 500;color: #5b5b5b;font-size: small;">
                                                                    PY-{{transactionId}}
                                                                </th>
                                                            </tr>
                                                            <tr>
                                                                <th
                                                                    style="text-align: left;line-height: 2.5;font-weight: bold;color: #6a6767;font-size: small;">
                                                                    Transaction Reference:
                                                                </th>
                                                                <th
                                                                    style="text-align: right;line-height: 2.5;font-weight: 500;color: #5b5b5b;font-size: small;">
                                                                    {{reference}}
                                                                </th>
                                                            </tr>
                                                        </table>
                                                        <span
                                                            style="border-bottom: 2px dotted #6a6767; display: inline-block; height: 1px; width: 100%;"></span>
                                                        <div style="padding-top: 10px;">
                                                            <small style="font-weight: small;">Support: <a
                                                                    href="mailto:support@idlms.gov.ng">support@idlms.gov.ng</a>
                                                            </small>
                                                            <br />
                                                            <small style="color: rgb(175, 58, 0);font-size: 12px;"><b>REFUND
                                                                    POLICY</b>: all payments to the goverment are not
                                                                refundable</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                style="color: #999999;font-size: 12px;clear: both;padding-top: 10px;text-align: center;width: 100%;">
                                                <p style="color: #000000;">The {{app_name}} Team</p>
                                                <br />
                                                <p>{{disclaimer}}</p>
                                                <br />
                                                <p style="color: #000000;">Copyright © {{date}} {{app_name}} <br> All Rights Reserved.</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <!-- END MAIN CONTENT AREA -->
                    </table>
                </div>
            </td>
            <td>&nbsp;</td>
        </tr>
    </table>
</body>

</html>`;
