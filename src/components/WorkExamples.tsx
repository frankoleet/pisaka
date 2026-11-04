import Image from "next/image";
import Icon from "./Icon";
import { workExamples } from "@/lib/config";

export default function WorkExamples() {
  return (
    <section id="examples" className="section work-examples">
      <div className="section-heading"><h2>Примеры работ</h2></div>
      <p className="examples-intro">{workExamples.some(example => example.image) ? "Посмотрите, как выглядят готовые СРС." : "Скоро здесь появятся фотографии наших СРС."}</p>
      <div className="examples-grid">
        {workExamples.map((example, index) => (
          <figure className="example-card" key={index}>
            <a className="example-photo" href={example.image} target="_blank" rel="noopener noreferrer" aria-label={example.title + " — открыть полное фото в новой вкладке"}>
              <Image src={example.image} alt={example.alt} width={960} height={1280} sizes="(max-width: 600px) calc(100vw - 28px), (max-width: 1168px) calc((100vw - 88px) / 3), 360px"/>
              <span className="example-tag">{example.tag}</span>
              <span className="example-open" aria-hidden="true"><Icon name="arrowUpRight"/></span>
            </a>
            <figcaption className="example-caption">{example.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
