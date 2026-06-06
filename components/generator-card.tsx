"use client";

import { useState } from "react";
import { GeneratorSetting, GeneratorSettingValue } from "@/lib/generators";

interface GeneratorCardProps {
  id: string;
  name: string;
  description: string;
  badge: string;
  values: string[];
  settingsDef: GeneratorSetting[];
  settingsValues: Record<string, GeneratorSettingValue>;
  onRegenerate: () => void;
  onSettingChange: (settingId: string, value: GeneratorSettingValue) => void;
}

export default function GeneratorCard({
  id,
  name,
  description,
  badge,
  values,
  settingsDef,
  settingsValues,
  onRegenerate,
  onSettingChange,
}: GeneratorCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
          console.error("Échec de la copie (fallback)", err);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Échec de la copie", err);
    }
  };

  return (
    <section
      id={id}
      className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row w-full h-full">
        {/* Partie Gauche : Informations & Paramètres */}
        <div className="flex flex-col w-full md:w-5/12 lg:w-[45%] md:border-r border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40 shrink-0">
          <div className="p-5 flex-1 flex flex-col justify-center">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg leading-tight">
                {name}
              </h3>
              <span className="shrink-0 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-700/50 whitespace-nowrap">
                {badge}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>

          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-900/60 mt-auto">
            {settingsDef.length > 0 && (
              <div className="pt-1 pb-5 mb-4 border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                  {settingsDef.map((setting) => (
                    <div key={setting.id} className="flex flex-col gap-1.5 justify-center">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
                        <span>{setting.label}</span>
                        {setting.type === "number" && (
                          <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                            {settingsValues[setting.id] as number}
                          </span>
                        )}
                      </label>
                      {setting.type === "number" && (
                        <input
                          type="range"
                          min={setting.min}
                          max={setting.max}
                          value={settingsValues[setting.id] as number}
                          onChange={(e) => onSettingChange(setting.id, parseInt(e.target.value, 10))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
                        />
                      )}
                      {setting.type === "boolean" && (
                        <label className="relative inline-flex items-center cursor-pointer mt-0.5">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settingsValues[setting.id] as boolean}
                            onChange={(e) => onSettingChange(setting.id, e.target.checked)}
                          />
                          <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                        </label>
                      )}
                      {setting.type === "text" && (
                        <input
                          type="text"
                          value={settingsValues[setting.id] as string}
                          onChange={(e) => onSettingChange(setting.id, e.target.value)}
                          className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                      {setting.type === "select" && (
                        <select
                          value={settingsValues[setting.id] as string}
                          onChange={(e) => onSettingChange(setting.id, e.target.value)}
                          className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {setting.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end w-full">
              <button
                onClick={onRegenerate}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:underline flex items-center gap-1.5 transition-colors ml-auto"
                aria-label={`Régénérer les valeurs pour ${name}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Régénérer
              </button>
            </div>
          </div>
        </div>

        {/* Partie Droite : Valeurs */}
        <div className="p-5 flex-1 flex flex-col justify-center gap-3 bg-white dark:bg-slate-900 border-t md:border-t-0 border-slate-100 dark:border-slate-800/60">
          {values.map((val, idx) => {
            const isCopied = copiedIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => handleCopy(val, idx)}
                className={`w-full text-left font-mono text-xs md:text-sm p-3.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-150 relative group flex items-center justify-between gap-4 ${
                  isCopied
                    ? "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 dark:bg-slate-900/50 dark:border-slate-800/50 dark:hover:bg-slate-800/40 dark:hover:border-slate-700 text-slate-800 dark:text-slate-300"
                }`}
                aria-label={`Copier la valeur ${idx + 1} de ${name}`}
                title={val}
              >
                <span className="truncate pr-4 select-all block w-full">{val}</span>
                <span className="shrink-0 flex items-center justify-center">
                  {isCopied ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Copié !
                    </span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.675a.625.625 0 00-.625-.625H8.25a.625.625 0 00-.625.625v.03c0 .223.08.43.22.585.12.13.29.215.48.215h7.25c.19 0 .36-.085.48-.215.14-.155.22-.362.22-.585v-.03z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 6.75h7.5M8.25 9h7.5M8.25 11.25h7.5M8.25 13.5h7.5"
                      />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
