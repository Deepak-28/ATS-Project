const cron = require('node-cron');
// const { job } = require("./config/index");
const { postOption: PostOption } = require("./config/index");// Replace with your actual Job model
const { Op } = require('sequelize');
// const { PostOption } = require('./config/index');

// 1. Activate job when postDate is reached
cron.schedule('0 0 * * * *', async () => {
  const now = new Date();
  // console.log(`Checking for jobs to activate at ${now.toISOString()}`);

  try {
    const jobsToPost = await PostOption.findAll({
      where: {
        postDate: {
          [Op.lte]: now,
        },
      },
    });

    for (const job of jobsToPost) {
      await job.update({ jobStatus: 'active' }); // or 'posted'
      // console.log(` Job ID ${job.jobId} posted.`);
    }
  } catch (err) {
    console.error(' Error posting jobs:', err);
  }
});

//  2. Expire job when ExpirayDate is passed
cron.schedule('0 0 */12 * * *', async () => {
  const now = new Date();
  // console.log(`Checking for expired jobs at ${now.toISOString()}`);

  try {
    const expiredJobs = await PostOption.findAll({
      where: {
        expirayDate: {
          [Op.lte]: now,
        },
      },
    });

    for (const job of expiredJobs) {
      await job.update({ status: 'expired' });
      // console.log(` Job ID ${job.jobId} marked as expired.`);
    }
  } catch (err) {
    console.error(' Error expiring jobs:', err);
  }
});
