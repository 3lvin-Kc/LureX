
# Understanding Phishing Simulation Links

## How Phishing Simulation Links Work (The Simple Version)

When you send a phishing simulation to your employees, there's a lot of clever technology working behind the scenes. Let's break down how these simulation links work in plain language.

### What happens when you click "Launch Campaign"?

When you click that button, here's what happens automatically:

1. **The system prepares personalized emails** for each person on your target list
2. **Each email gets a unique tracking code** (like a digital fingerprint)
3. **Special links are created** that look real but actually point to your simulation
4. **Emails are scheduled** to be sent at the time you selected
5. **The system starts monitoring** for when people receive, open, and click the emails

All of this happens without you needing to write a single line of code or understand the technical details!

### Where do the links in the emails actually go?

When someone clicks a link in your simulation email:

1. **First, they go to our secure tracking server** (not directly to the fake phishing page)
2. **The system records that this specific person clicked the link**
3. **They are then instantly redirected** to either:
   - A fake login page that looks like the real thing (but is completely safe)
   - A training page explaining that this was a security test
   - Any other destination you configured in the campaign

### How does the tracking work?

Each link contains a special code (called a tracking ID) that tells our system:

- **Who clicked** the link (which employee)
- **Which campaign** the link belongs to
- **When they clicked** it (date and time)
- **What device** they were using

This tracking happens instantly and is completely invisible to the person clicking the link.

### Where are the fake websites hosted?

The fake phishing pages (like login screens) are hosted on our secure servers. They:

- **Look authentic** (like the real website they're imitating)
- **Collect no actual sensitive data** (any passwords entered are immediately discarded)
- **Are completely isolated** from real systems
- **Include a clear disclaimer** at the bottom indicating it's a security training exercise

### The complete journey (behind the scenes)

Here's the full technical journey that happens automatically:

1. **Campaign creation**: You select a template, target audience, and schedule
2. **Link generation**: The system creates unique tracking links for each recipient
3. **Email delivery**: Emails are sent through our secure email servers
4. **Click tracking**: When someone clicks, our edge function records the activity
5. **Website simulation**: The person sees a realistic (but safe) phishing page
6. **Data recording**: All interactions are recorded for reporting
7. **Training delivery**: If configured, instant training appears after they fall for the simulation
8. **Results compilation**: Everything is organized into easy-to-understand reports

### Security and safety features

Our platform includes several safety features:

- **No real data collection**: We never store actual passwords or sensitive information
- **Isolation**: Simulation environments are completely separate from real systems
- **Legal compliance**: All simulations follow relevant privacy and security regulations
- **Educational focus**: The goal is learning, not tricking people

## How to explain this to your team

When rolling out phishing simulations, it helps to explain to your team:

"We're running security awareness exercises where you might receive test phishing emails. These are completely safe and designed to help us all learn to spot real threats. If you fall for one, don't worry! It's a learning opportunity, not a test you pass or fail."

Remember, the best phishing simulations aren't about catching people - they're about teaching everyone to be more security-aware in a positive, supportive way.
