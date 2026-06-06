"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { GENERATORS, GeneratorSettingValue } from "@/lib/generators";
import GeneratorCard from "@/components/generator-card";

export default function Home() {
  const [values, setValues] = useState<Record<string, string[]>>({});
  const [settingsState, setSettingsState] = useState<Record<string, Record<string, GeneratorSettingValue>>>({});
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Regenerate all cards
  const regenerateAll = useCallback(() => {
    setValues(() => {
      const newValues: Record<string, string[]> = {};
      GENERATORS.forEach((gen) => {
        const list: string[] = [];
        const currentSettings = settingsState[gen.id] || {};
        for (let i = 0; i < gen.count; i++) {
          list.push(gen.generate(currentSettings));
        }
        newValues[gen.id] = list;
      });
      return newValues;
    });
  }, [settingsState]);

  // Regenerate single card
  const regenerateCard = useCallback(
    (id: string) => {
      setValues((prevValues) => {
        const gen = GENERATORS.find((g) => g.id === id);
        if (!gen) return prevValues;

        const list: string[] = [];
        const currentSettings = settingsState[id] || {};
        for (let i = 0; i < gen.count; i++) {
          list.push(gen.generate(currentSettings));
        }
        return {
          ...prevValues,
          [id]: list,
        };
      });
    },
    [settingsState]
  );

  // Handle setting changes and regenerate immediately
  const handleSettingChange = useCallback((genId: string, settingId: string, value: GeneratorSettingValue) => {
    setSettingsState((prev) => {
      const newSettings = {
        ...prev,
        [genId]: {
          ...prev[genId],
          [settingId]: value,
        },
      };

      // Regenerate values for this specific generator
      const gen = GENERATORS.find((g) => g.id === genId);
      if (gen) {
        setValues((prevValues) => {
          const list: string[] = [];
          for (let i = 0; i < gen.count; i++) {
            list.push(gen.generate(newSettings[genId]));
          }
          return {
            ...prevValues,
            [genId]: list,
          };
        });
      }

      return newSettings;
    });
  }, []);

  // Initial client-side mount: load theme, default settings, and generate first batch
  useEffect(() => {
    const timer = setTimeout(() => {
      // Theme initialization
      const savedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      } else {
        setTheme("light");
        document.documentElement.classList.remove("dark");
      }

      // Initialize default settings and values
      const initialSettings: Record<string, Record<string, GeneratorSettingValue>> = {};
      const newValues: Record<string, string[]> = {};

      GENERATORS.forEach((gen) => {
        const genSettings: Record<string, GeneratorSettingValue> = {};
        gen.settings.forEach((setting) => {
          genSettings[setting.id] = setting.defaultValue;
        });
        initialSettings[gen.id] = genSettings;

        const list: string[] = [];
        for (let i = 0; i < gen.count; i++) {
          list.push(gen.generate(genSettings));
        }
        newValues[gen.id] = list;
      });

      setSettingsState(initialSettings);
      setValues(newValues);
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut listener ("R" to regenerate all)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          activeElement.getAttribute("contenteditable") === "true");

      if (e.key.toLowerCase() === "r" && !isInput) {
        e.preventDefault();
        regenerateAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [regenerateAll]);

  // Toggle theme
  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Smooth scroll to card
  const scrollToCard = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-indigo-500", "dark:ring-indigo-400");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-indigo-500", "dark:ring-indigo-400");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/GenSentinel_Logo.png"
              alt="GenSentinel Logo"
              width={48}
              height={48}
              className="rounded-lg shadow-sm"
              priority
            />
            <div className="hidden sm:flex items-center">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                100% Côté Client
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Basculer le thème"
            >
              {theme === "light" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M9.75 12h-.5m11.25 0h-.5M5.029 5.029l1.591 1.591M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9zm-9-5.625a5.625 5.625 0 100 11.25 5.625 5.625 0 000-11.25zm-6.22 12.18l1.591-1.591m11.21 11.21l-1.591-1.591M18.364 5.636l-1.591 1.591m0 11.318l1.591 1.591" />
                </svg>
              )}
            </button>

            <button
              onClick={regenerateAll}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Tout régénérer
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 md:py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Clés sécurisées & Mots de passe
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 mt-3">
                Générez des mots de passe, clés d&apos;API, jetons et secrets cryptographiquement sécurisés localement dans votre navigateur. Cliquez sur n&apos;importe quelle valeur pour la copier.
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap justify-center sm:justify-start items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-inner">
              <div className="text-center sm:text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Raccourci Clavier
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  Appuyez sur <kbd className="font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm border border-slate-300/60 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold mx-1">R</kbd> pour tout régénérer
                </span>
              </div>
              <button
                onClick={regenerateAll}
                className="bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300/40 dark:border-slate-700/50 transition-colors"
                aria-label="Tout régénérer"
              >
                Tout régénérer
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 dark:border-slate-800/60 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
              Générateurs populaires
            </span>
            <div className="flex flex-wrap gap-2.5">
              {[
                { name: "Mots de passe", id: "password" },
                { name: "UUID", id: "uuid-v4" },
                { name: "Secret JWT", id: "jwt-secret" },
                { name: "Clé d'API", id: "api-key" },
                { name: "Hexadécimal", id: "hex-key" },
                { name: "WiFi", id: "wifi-password" },
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToCard(link.id)}
                  className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800/50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 dark:hover:bg-indigo-950/20 dark:hover:border-indigo-900/40 dark:hover:text-indigo-400 transition-all cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Generators */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex-1 w-full">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {!mounted
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-pulse min-h-[200px]"
                >
                  <div className="flex flex-col w-full md:w-5/12 lg:w-[45%] p-5 border-r border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40">
                    <div className="space-y-3 w-full">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-5/6"></div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-4/6 mt-2"></div>
                    </div>
                    <div className="mt-auto pt-6">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-center space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-11 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-full"></div>
                    ))}
                  </div>
                </div>
              ))
            : GENERATORS.map((gen) => {
                const currentSettings = settingsState[gen.id] || {};
                return (
                  <GeneratorCard
                    key={gen.id}
                    id={gen.id}
                    name={gen.name}
                    description={gen.description}
                    badge={gen.badge(currentSettings)}
                    values={values[gen.id] || []}
                    settingsDef={gen.settings}
                    settingsValues={currentSettings}
                    onSettingChange={(settingId, value) => handleSettingChange(gen.id, settingId, value)}
                    onRegenerate={() => regenerateCard(gen.id)}
                  />
                );
              })}
        </div>
      </main>

      {/* Why this tool? Section */}
      <section className="bg-white dark:bg-slate-900 border-t border-b border-slate-200 dark:border-slate-800 py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Pourquoi utiliser GenSentinel ?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2.5 text-base">
              Une alternative privée, sécurisée et pensée pour les développeurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Aucune inscription",
                desc: "Générez des clés instantanément. Pas de compte, pas d'email, aucune configuration nécessaire.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                ),
              },
              {
                title: "Génération 100% locale",
                desc: "Toutes les valeurs sont générées instantanément dans votre navigateur web. Aucun appel serveur n'est effectué.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                ),
              },
              {
                title: "Zéro tracking et logs",
                desc: "Aucun code de suivi, aucune base de données et aucun script d'analyse. La confidentialité avant tout.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.863 7.863L21 21m-2.228-2.228l-3.976-3.977m0-3.774a3 3 0 00-3.774 3.774m0 0l3.976 3.977" />
                ),
              },
              {
                title: "Instantané",
                desc: "Construit avec des technologies modernes pour un chargement ultra-rapide et un rendu des clés en quelques millisecondes.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                ),
              },
              {
                title: "Utilise l'API Web Crypto",
                desc: "Repose strictement sur crypto.getRandomValues() côté client. N'utilise jamais Math.random().",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.068-1.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                ),
              },
              {
                title: "Copier-coller facile",
                desc: "Un clic copie immédiatement le secret. Composants accessibles avec un retour visuel clair.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24a.75.75 0 011.05-.143C12 6.782 12.82 7.5 13.5 7.5h.008c.68 0 1.5-.718 2.414-1.515a.75.75 0 111.028 1.09c-1.11 1.01-2.22 1.925-3.442 1.925h-.008c-1.222 0-2.333-.915-3.443-1.925a.75.75 0 01-.143-1.05z" />
                ),
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/55 dark:bg-slate-900/30"
              >
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    {benefit.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 border-t border-slate-800/60 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="flex items-center">
                <Image
                  src="/GenSentinel_Logo.png"
                  alt="GenSentinel Logo"
                  width={48}
                  height={48}
                  className="rounded-lg shadow-sm"
                />
              </div>
              <p className="text-sm max-w-md leading-relaxed text-slate-400">
                Un utilitaire simple et sécurisé pour générer des clés aléatoires robustes. Toutes les générations sont 100% locales en utilisant l&apos;API Web Crypto. Aucune clé n&apos;est envoyée ou conservée.
              </p>
            </div>

            <div className="space-y-4 md:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Avis de sécurité
              </span>
              <p className="text-xs max-w-md md:ml-auto leading-relaxed text-slate-500">
                Généré localement dans votre navigateur via Web Crypto. Pour les secrets critiques en production, privilégiez la génération et le stockage au sein de votre propre infrastructure sécurisée ou de votre gestionnaire de mots de passe.
              </p>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} GenSentinel. Utilitaire open source côté client.
            </div>
            <div className="flex gap-4">
              <span>Sans cookies</span>
              <span>&bull;</span>
              <span>Sans tracking</span>
              <span>&bull;</span>
              <span>Chiffrement local</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
