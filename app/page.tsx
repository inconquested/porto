import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { ExperienceSection } from "@/components/sections/experience";
import { WorksSection } from "@/components/sections/works";
import { SkillsSection } from "@/components/skills";
import { EducationSection } from "@/components/sections/education";
import { CallToAction } from "@/components/sections/cta";
import { Footer } from "@/components/site-footer";

export default async function Home() {
  const t = await getTranslations("Index");
  const tFooter = await getTranslations("Footer");
  const tHeader = await getTranslations("Header");

  const hero = {
    main: t("hero.main"),
    subtitle: t("hero.subtitle"),
    cta: t("hero.cta"),
  };

  const about = {
    eyebrow: t("about.eyebrow"),
    title: t("about.title"),
    lede: t("about.lede"),
    detail: t("about.detail"),
    facts: t.raw("about.facts") as { label: string; value: string }[],
  };

  const experience = {
    eyebrow: t("experience.eyebrow"),
    title: t("experience.title"),
    subtitle: t("experience.subtitle"),
    lists: t.raw("experience.lists") as { title: string; subtitle: string; description: string }[],
  };

  const project = {
    eyebrow: t("project.eyebrow"),
    title: t("project.title"),
    subtitle: t("project.subtitle"),
    lists: t.raw("project.lists") as {
      title: string;
      subtitle: string;
      description: string;
      tech_stack?: string[];
      demo_url?: string;
      repo_url?: string;
      case_study?: { problem: string; solution: string; highlights: string[] };
    }[],
    study: {
      label: t("project.study.label"),
      problem: t("project.study.problem"),
      solution: t("project.study.solution"),
      highlights: t("project.study.highlights"),
      close: t("project.study.close"),
    },
  };

  const skills = {
    eyebrow: t("skill.eyebrow"),
    title: t("skill.title"),
    subtitle: t("skill.subtitle"),
    lists: t.raw("skill.lists") as { title: string; subtitle: string; description: string }[],
    techStack: t.raw("skill.tech_stack") as Record<string, string[]>,
  };

  const education = {
    eyebrow: t("education.eyebrow"),
    title: t("education.title"),
    subtitle: t("education.subtitle"),
    lists: t.raw("education.lists") as { title: string; subtitle: string; description: string },
  };

  const cta = {
    eyebrow: t("cta.eyebrow"),
    title: t("cta.title"),
    subtitle: t("cta.subtitle"),
    button: t("cta.button"),
  };

  const footer = {
    tagline: tFooter("tagline"),
    sitemap: tFooter("sitemap"),
    connect: tFooter("connect"),
    colophon: tFooter("colophon"),
    colophonText: tFooter("colophonText"),
    location: tFooter("location"),
    rights: tFooter("rights"),
    backToTop: tFooter("backToTop"),
    header: {
      home: tHeader("home"),
      about: tHeader("about"),
      experience: tHeader("experience"),
      project: tHeader("project"),
      skill: tHeader("skill"),
      education: tHeader("education"),
      cta: tHeader("cta"),
    },
  };

  return (
    <>
      <main className="relative z-[2] w-full font-sans">
        <Hero hero={hero} />
        <AboutSection about={about} />
        <ExperienceSection experience={experience} />
        <WorksSection project={project} />
        <SkillsSection skills={skills} />
        <EducationSection education={education} />
        <CallToAction cta={cta} />
      </main>
      <Footer footer={footer} />
    </>
  );
}
