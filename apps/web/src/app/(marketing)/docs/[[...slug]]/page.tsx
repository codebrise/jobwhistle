import Link from 'next/link';
import { notFound } from 'next/navigation';
import { docArticles } from '@/content/docs';
import { docsNavSections } from '@/content/navigation';
import { BookOpen, ChevronRight } from 'lucide-react';

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export async function generateMetadata({ params }: Props) {
  const resolved = await params;
  const slugKey = resolved.slug ? resolved.slug.join('/') : 'index';
  const article = docArticles[slugKey] || docArticles.index;

  return {
    title: `${article.title} — Jobwhistle Docs`,
    description: article.description,
  };
}

export default async function DocsPage({ params }: Props) {
  const resolved = await params;
  const slugKey = resolved.slug ? resolved.slug.join('/') : 'index';
  const article = docArticles[slugKey];

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Docs Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#2C3936] text-white font-bold">
            <BookOpen className="w-5 h-5 text-[#C8F169]" />
            <span>Jobwhistle Docs</span>
          </div>

          <div className="space-y-6">
            {docsNavSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
                  {section.title}
                </div>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const itemSlug = item.href.replace('/docs/', '').replace('/docs', '');
                    const isCurrent =
                      (slugKey === 'index' && itemSlug === '') || slugKey === itemSlug;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            isCurrent
                              ? 'bg-[#1C2928] text-[#C8F169] font-medium border border-[#2C3936]'
                              : 'text-[#A0ADA7] hover:text-white hover:bg-[#142522]'
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Article Content */}
        <article className="lg:col-span-9 space-y-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-[#687670]">
            <Link href="/docs" className="hover:text-[#A0ADA7]">
              Docs
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{article.category}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#C8F169]">{article.title}</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {article.title}
            </h1>
            <p className="text-base text-[#A0ADA7] mt-2 leading-relaxed">
              {article.description}
            </p>
          </div>

          {/* Article Markdown Render */}
          <div className="rounded-xl border border-[#2C3936] bg-[#131E1E] p-8 text-[#EAF0EC] space-y-4 prose prose-invert max-w-none">
            <div
              className="space-y-4 text-sm leading-relaxed text-[#EAF0EC]/90"
              dangerouslySetInnerHTML={{
                __html: article.content
                  .replace(/### (.*)/g, '<h3 class="text-xl font-bold text-white mt-6 mb-2">$1</h3>')
                  .replace(/## (.*)/g, '<h2 class="text-2xl font-bold text-white mt-8 mb-3 border-b border-[#2C3936] pb-2">$1</h2>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                  .replace(/`([^`]+)`/g, '<code class="bg-[#0D1515] text-[#C8F169] px-1.5 py-0.5 rounded font-mono text-xs border border-[#2C3936]">$1</code>')
                  .replace(/\n\n/g, '<br/><br/>'),
              }}
            />
          </div>

          {/* Footer Navigation */}
          <div className="pt-8 border-t border-[#2C3936] flex items-center justify-between">
            <Link href="/docs" className="text-sm text-[#A0ADA7] hover:text-[#C8F169]">
              &larr; Return to Documentation Overview
            </Link>
            <Link href="/register" className="text-sm font-semibold text-[#C8F169] hover:underline">
              Create an Account &rarr;
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
