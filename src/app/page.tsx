import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Inbox,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SubZeroLogo } from '@/components/ui/logo';
import styles from './home.module.css';

const pageDescription = 'Find subscriptions in Gmail receipts, see your recurring spend and upcoming renewals, and decide what to keep.';

export const metadata: Metadata = {
  title: { absolute: 'SubZero — Know what keeps charging you' },
  description: pageDescription,
  openGraph: {
    title: 'SubZero — Know what keeps charging you',
    description: pageDescription,
    type: 'website',
  },
  twitter: {
    title: 'SubZero — Know what keeps charging you',
    description: pageDescription,
  },
};

const sampleSubscriptions = [
  { initial: 'S', name: 'Streaming plan', category: 'Entertainment', amount: '₹649', tone: 'violet' },
  { initial: 'C', name: 'Cloud storage', category: 'Utilities', amount: '₹1,499', tone: 'blue' },
  { initial: 'M', name: 'Music plan', category: 'Entertainment', amount: '₹199', tone: 'peach' },
] as const;

function HomepageHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.navInner}>
        <Link className={styles.brand} href="/" aria-label="SubZero home">
          <SubZeroLogo className={styles.brandMark} />
          <span>SubZero</span>
        </Link>

        <nav className={styles.navLinks} aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">What you get</a>
          <a href="#privacy">Privacy</a>
          <Link href="/pricing">Pricing</Link>
        </nav>

        <div className={styles.navActions}>
          <Link className={styles.loginLink} href="/login">Log in</Link>
          <Link className={styles.navCta} href="/register">
            Get started <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function DashboardPreview() {
  return (
    <div className={styles.previewStage}>
      <div className={styles.previewCaption}>
        <span className={styles.previewCaptionLine} />
        A peek inside SubZero
        <span className={styles.previewCaptionLine} />
      </div>

      <div className={styles.dashboard} aria-label="Illustrative subscription dashboard with sample data">
        <div className={styles.dashboardTopbar}>
          <div className={styles.dashboardIdentity}>
            <SubZeroLogo className={styles.dashboardLogo} />
            <span>SubZero</span>
            <span className={styles.dashboardSlash}>/</span>
            <span className={styles.dashboardPageName}>Overview</span>
          </div>
          <span className={styles.sampleBadge}>Sample data</span>
        </div>

        <div className={styles.dashboardBody}>
          <aside className={styles.dashboardSidebar} aria-hidden="true">
            <div className={styles.sidebarActive}><span className={styles.sidebarSquare} /> Overview</div>
            <div><span className={styles.sidebarLines} /> Subscriptions</div>
            <div><span className={styles.sidebarCircle} /> Analytics</div>
            <div className={styles.sidebarBottom}>A clearer picture of your money.</div>
          </aside>

          <div className={styles.dashboardContent}>
            <div className={styles.dashboardHeading}>
              <div>
                <p className={styles.dashboardEyebrow}>YOUR OVERVIEW</p>
                <h2>Recurring, made visible.</h2>
              </div>
              <span className={styles.dashboardPeriod}>This month</span>
            </div>

            <div className={styles.dashboardMetrics}>
              <div className={styles.spendCard}>
                <p>Monthly recurring</p>
                <div className={styles.spendAmount}>₹2,347 <span>/ month</span></div>
                <div className={styles.spendCardBottom}>
                  <span className={styles.spendDot} /> Across 3 subscriptions
                </div>
              </div>
              <div className={styles.nextCard}>
                <div className={styles.nextIcon}><CreditCard size={17} aria-hidden="true" /></div>
                <div>
                  <p>Next renewal</p>
                  <strong>Cloud storage</strong>
                  <span>Coming up in 6 days</span>
                </div>
              </div>
            </div>

            <div className={styles.previewList}>
              <div className={styles.previewListHeading}>
                <strong>Your subscriptions</strong>
                <span>Monthly equivalent</span>
              </div>
              {sampleSubscriptions.map((subscription) => (
                <div className={styles.previewRow} key={subscription.name}>
                  <div className={styles.previewService}>
                    <span className={`${styles.serviceAvatar} ${styles[subscription.tone]}`}>{subscription.initial}</span>
                    <span><strong>{subscription.name}</strong><small>{subscription.category}</small></span>
                  </div>
                  <span className={styles.previewAmount}>{subscription.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className={styles.previewDisclosure}>Illustrative preview. Figures and services are examples.</p>
    </div>
  );
}

function Step({ number, icon, title, children }: {
  number: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className={styles.step}>
      <div className={styles.stepTop}><span>{number}</span><span className={styles.stepIcon}>{icon}</span></div>
      <h3>{title}</h3>
      <p>{children}</p>
    </li>
  );
}

function HomepageFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>
          <Link className={styles.brand} href="/" aria-label="SubZero home">
            <SubZeroLogo className={styles.brandMark} />
            <span>SubZero</span>
          </Link>
          <p>Know what keeps charging you.</p>
        </div>
        <nav aria-label="Footer navigation" className={styles.footerLinks}>
          <Link href="/pricing">Pricing</Link>
          <Link href="/docs">Help</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <span className={styles.copyright}>© {new Date().getFullYear()} SubZero</span>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main">Skip to content</a>
      <HomepageHeader />

      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}><span className={styles.eyebrowDot} /> YOUR MONEY, IN FOCUS</p>
              <h1 id="hero-title">Know what keeps <em>charging you.</em></h1>
              <p className={styles.heroDescription}>
                SubZero finds subscriptions in Gmail receipts and puts your recurring costs and next renewals in one place. Review and correct the results in your dashboard.
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryButton} href="/register">
                  Create a free account <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
                <a className={styles.textButton} href="#how-it-works">
                  See how it works <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>
              <p className={styles.heroNote}><ShieldCheck size={17} aria-hidden="true" /> Read-only Gmail access. You decide what to keep.</p>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <div className={styles.valueStrip} aria-label="SubZero highlights">
          <div className={styles.valueStripInner}>
            <span><Check size={17} aria-hidden="true" /> Subscriptions in one place</span>
            <span><Check size={17} aria-hidden="true" /> Renewal reminders</span>
            <span><Check size={17} aria-hidden="true" /> Read-only Gmail access</span>
          </div>
        </div>

        <section id="how-it-works" className={styles.howSection} aria-labelledby="how-title">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionIntro}>
              <p className={styles.sectionLabel}>HOW IT WORKS</p>
              <h2 id="how-title">Turn receipts into a working list.</h2>
              <p>Start with the inbox you already use. SubZero helps sort out which charges keep coming back.</p>
            </div>
            <ol className={styles.steps}>
              <Step number="01" icon={<Inbox size={24} strokeWidth={1.7} aria-hidden="true" />} title="Connect your Gmail">
                Sign in, then give SubZero read-only access. Add more than one account if your receipts are spread around.
              </Step>
              <Step number="02" icon={<Sparkles size={24} strokeWidth={1.7} aria-hidden="true" />} title="Review what it finds">
                SubZero scans likely receipts. Gemini extracts subscription details and adds likely matches to your dashboard for you to review or correct.
              </Step>
              <Step number="03" icon={<MailCheck size={24} strokeWidth={1.7} aria-hidden="true" />} title="Stay a step ahead">
                See the recurring total, watch upcoming renewals, and choose which reminders you want to receive.
              </Step>
            </ol>
          </div>
        </section>

        <section id="features" className={styles.featuresSection} aria-labelledby="features-title">
          <div className={styles.sectionContainer}>
            <div className={styles.featureIntro}>
              <div>
                <p className={styles.sectionLabel}>THE USEFUL PART</p>
                <h2 id="features-title">See the charges behind the total.</h2>
              </div>
              <p>Check costs, spot the next renewal, or ask a question about what you are paying for.</p>
            </div>

            <div className={styles.featureGrid}>
              <article className={styles.featureLarge}>
                <div className={styles.featureCopy}>
                  <span className={styles.featureIndex}>01 / SPENDING</span>
                  <h3>See the monthly total and what makes it up.</h3>
                  <p>Every tracked plan adds to one recurring total, with its price and billing details close by.</p>
                </div>
                <div className={styles.chartPreview} aria-label="Illustrative recurring spending chart using sample data">
                  <div className={styles.chartHeader}><span>Recurring spend</span><span>Example view</span></div>
                  <div className={styles.chartBars} aria-hidden="true">
                    {[45, 52, 47, 67, 61, 79, 72].map((height, index) => (
                      <div className={styles.chartColumn} key={index}>
                        <div style={{ height: `${height}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className={styles.chartMonths}><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span></div>
                </div>
              </article>

              <article className={styles.featureSmall}>
                <div className={styles.featureCopy}>
                  <span className={styles.featureIndex}>02 / TIMING</span>
                  <h3>Know what renews before it does.</h3>
                  <p>Upcoming renewals and reminder emails give you time to make a decision.</p>
                </div>
                <div className={styles.renewalPreview} aria-label="Illustrative renewal reminder with sample data">
                  <div className={styles.renewalIcon}><MailCheck size={20} aria-hidden="true" /></div>
                  <div><span>UPCOMING RENEWAL</span><strong>Cloud storage</strong><p>Review before your next charge</p></div>
                  <ChevronRight size={18} aria-hidden="true" />
                </div>
              </article>

              <article className={styles.featureWide}>
                <div className={styles.featureCopy}>
                  <span className={styles.featureIndex}>03 / INSIGHT</span>
                  <h3>Ask about your own subscriptions.</h3>
                  <p>Ask SubZero about your tracked subscriptions and get an answer grounded in your own dashboard data.</p>
                </div>
                <div className={styles.chatPreview} aria-label="Illustrative Ask SubZero conversation using sample data">
                  <div className={styles.chatQuestion}>What am I spending on entertainment?</div>
                  <div className={styles.chatAnswer}><span className={styles.chatSparkle}><Sparkles size={16} aria-hidden="true" /></span><span>In this example, your music and streaming plans add up to <strong>₹848 per month.</strong></span></div>
                  <span className={styles.chatDisclosure}>Example conversation</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="privacy" className={styles.privacySection} aria-labelledby="privacy-title">
          <div className={styles.privacyInner}>
            <div className={styles.privacyCopy}>
              <p className={styles.sectionLabel}>PRIVACY BY DESIGN</p>
              <h2 id="privacy-title">Your inbox is personal. Access should be deliberate.</h2>
              <p>SubZero uses Gmail read-only permission to find likely subscription receipts. It cannot send or delete your mail. Relevant receipt text is processed for extraction, and connected accounts can be removed from your dashboard.</p>
              <Link href="/privacy">Read our privacy policy <ArrowUpRight size={17} aria-hidden="true" /></Link>
            </div>
            <div className={styles.privacyPoints}>
              <div><span><ShieldCheck size={22} aria-hidden="true" /></span><div><h3>Read-only Gmail scope</h3><p>Scanning without permission to change your messages.</p></div></div>
              <div><span><LockKeyhole size={22} aria-hidden="true" /></span><div><h3>Encrypted connected tokens</h3><p>OAuth tokens are encrypted before they are stored.</p></div></div>
              <div><span><CircleHelp size={22} aria-hidden="true" /></span><div><h3>Clear choices</h3><p>Review detected records and disconnect a Gmail account when you want to.</p></div></div>
            </div>
          </div>
        </section>

        <section className={styles.faqSection} aria-labelledby="faq-title">
          <div className={styles.faqInner}>
            <div className={styles.faqIntro}>
              <p className={styles.sectionLabel}>GOOD TO KNOW</p>
              <h2 id="faq-title">A few straight answers.</h2>
              <p>Before you connect an inbox, here is what SubZero does and where you stay in control.</p>
            </div>
            <div className={styles.faqList}>
              <details><summary>Does SubZero cancel subscriptions for me?<span aria-hidden="true">+</span></summary><p>No. SubZero helps you spot and track subscriptions. You decide what to cancel with each provider.</p></details>
              <details><summary>Can I add something it did not find?<span aria-hidden="true">+</span></summary><p>Yes. You can add or edit subscriptions manually in your dashboard.</p></details>
              <details><summary>What happens when I connect Gmail?<span aria-hidden="true">+</span></summary><p>You authorize read-only Gmail access. SubZero scans likely receipt messages, uses Gemini to extract subscription details, and stores encrypted OAuth tokens for the connection. It cannot send or delete your email.</p></details>
            </div>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="final-title">
          <div className={styles.finalInner}>
            <span className={styles.finalKicker}>READY WHEN YOU ARE</span>
            <h2 id="final-title">Ready to see the whole list?</h2>
            <p>Create an account, connect Gmail, and review what SubZero finds. Add or correct anything along the way.</p>
            <Link className={styles.finalButton} href="/register">Create a free account <ArrowUpRight size={19} aria-hidden="true" /></Link>
            <span>Already have an account? <Link href="/login">Log in</Link></span>
          </div>
        </section>
      </main>

      <HomepageFooter />
    </div>
  );
}
