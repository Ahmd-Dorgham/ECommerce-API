import { scheduleJob } from "node-schedule";
import { DateTime } from "luxon";
import { Coupon } from "../../DB/Models/index.js";

export const disableCouponsCron = () => {
  scheduleJob("0 59 23 * * *", async () => {
    console.log("Cron job to disable coupons executed");
    const enabledCoupons = await Coupon.find({ isEnabled: true });

    if (enabledCoupons.length) {
      for (const coupon of enabledCoupons) {
        if (DateTime.now() > DateTime.fromJSDate(coupon.till)) {
          coupon.isEnabled = false;
          await coupon.save();
        }
      }
    }
  });
};
