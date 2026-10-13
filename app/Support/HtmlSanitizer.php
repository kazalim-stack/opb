<?php

namespace App\Support;

use DOMDocument;
use DOMElement;

class HtmlSanitizer
{
    private const ALLOWED_TAGS = [
        'p',
        'br',
        'b',
        'strong',
        'i',
        'em',
        'u',
        's',
        'span',

        'h1',
        'h2',
        'h3',

        'ul',
        'ol',
        'li',
    ];

    private const ALLOWED_STYLE_PROPS = [
        'color',
        'font-family',
        'font-size',
        'font-weight',
        'font-style',
        'text-decoration',
        'text-align',
        'background-color',
    ];

    private const DANGEROUS_TAGS = [
        'script',
        'style',
        'iframe',
        'object',
        'embed',
        'link',
        'meta',
        'form',
        'input',
        'svg',
    ];

    public static function clean(
        ?string $html
    ): string {
        if (
            $html === null ||
            trim($html) === ''
        ) {
            return '';
        }

        $dom = new DOMDocument();

        libxml_use_internal_errors(true);

        $dom->loadHTML(
            '<?xml encoding="utf-8" ?>' .
            '<div id="__root__">' .
            $html .
            '</div>',
            LIBXML_HTML_NOIMPLIED |
            LIBXML_HTML_NODEFDTD
        );

        libxml_clear_errors();

        $root =
            $dom->getElementById(
                '__root__'
            );

        if (!$root) {
            return '';
        }

        self::sanitizeNode(
            $root,
            $dom
        );

        $result = '';

        foreach (
            $root->childNodes as $child
        ) {
            $result .=
                $dom->saveHTML($child);
        }

        return $result;
    }

    private static function sanitizeNode(
        DOMElement $node,
        DOMDocument $dom
    ): void {
        $children = [];

        foreach (
            $node->childNodes as $child
        ) {
            $children[] = $child;
        }

        foreach (
            $children as $child
        ) {
            if (
                $child->nodeType ===
                XML_COMMENT_NODE
            ) {
                $node->removeChild(
                    $child
                );

                continue;
            }

            if (
                $child->nodeType !==
                XML_ELEMENT_NODE
            ) {
                continue;
            }

            $tag =
                strtolower(
                    $child->nodeName
                );

            if (
                in_array(
                    $tag,
                    self::DANGEROUS_TAGS,
                    true
                )
            ) {
                $node->removeChild(
                    $child
                );

                continue;
            }

            self::sanitizeNode(
                $child,
                $dom
            );

            if (
                !in_array(
                    $tag,
                    self::ALLOWED_TAGS,
                    true
                )
            ) {
                while (
                    $child->firstChild
                ) {
                    $node->insertBefore(
                        $child->firstChild,
                        $child
                    );
                }

                $node->removeChild(
                    $child
                );

                continue;
            }

            self::stripAttributes(
                $child
            );
        }
    }

    private static function stripAttributes(
        DOMElement $element
    ): void {
        if (
            !$element->hasAttributes()
        ) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Preserve Quill list information
        |--------------------------------------------------------------------------
        |
        | Quill represents lists using:
        |
        | data-list="bullet"
        | data-list="ordered"
        |
        | Only these exact values are allowed.
        |
        */

        $dataList = '';

        if (
            $element->hasAttribute(
                'data-list'
            )
        ) {
            $candidate =
                strtolower(
                    trim(
                        $element->getAttribute(
                            'data-list'
                        )
                    )
                );

            if (
                $candidate === 'bullet' ||
                $candidate === 'ordered'
            ) {
                $dataList = $candidate;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Convert Quill alignment classes
        |--------------------------------------------------------------------------
        |
        | Quill uses classes such as:
        |
        | ql-align-left
        | ql-align-center
        | ql-align-right
        | ql-align-justify
        |
        | We convert only these known classes into
        | safe inline text-align styles.
        |
        */

        $alignment = '';

        if (
            $element->hasAttribute(
                'class'
            )
        ) {
            $class =
                trim(
                    $element->getAttribute(
                        'class'
                    )
                );

            $classes =
                preg_split(
                    '/\s+/',
                    $class
                );

            foreach (
                $classes as $className
            ) {
                if (
                    $className ===
                    'ql-align-left'
                ) {
                    $alignment = 'left';

                    break;
                }

                if (
                    $className ===
                    'ql-align-center'
                ) {
                    $alignment = 'center';

                    break;
                }

                if (
                    $className ===
                    'ql-align-right'
                ) {
                    $alignment = 'right';

                    break;
                }

                if (
                    $className ===
                    'ql-align-justify'
                ) {
                    $alignment = 'justify';

                    break;
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Preserve existing inline style
        |--------------------------------------------------------------------------
        */

        $style =
            $element->getAttribute(
                'style'
            );

        /*
        |--------------------------------------------------------------------------
        | Remove all attributes
        |--------------------------------------------------------------------------
        */

        $attributeNames = [];

        foreach (
            $element->attributes
            as $attribute
        ) {
            $attributeNames[] =
                $attribute->name;
        }

        foreach (
            $attributeNames as $name
        ) {
            $element->removeAttribute(
                $name
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Restore sanitized inline style
        |--------------------------------------------------------------------------
        */

        $safeStyle = '';

        if ($style !== '') {
            $safeStyle =
                self::sanitizeStyle(
                    $style
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Add safe Quill alignment
        |--------------------------------------------------------------------------
        */

        if ($alignment !== '') {
            if ($safeStyle !== '') {
                $safeStyle .= '; ';
            }

            $safeStyle .=
                'text-align: ' .
                $alignment;
        }

        if ($safeStyle !== '') {
            $element->setAttribute(
                'style',
                $safeStyle
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Restore safe Quill list attribute
        |--------------------------------------------------------------------------
        */

        if (
            $dataList !== ''
        ) {
            $element->setAttribute(
                'data-list',
                $dataList
            );
        }
    }

    private static function sanitizeStyle(
        string $style
    ): string {
        $safe = [];

        foreach (
            explode(';', $style)
            as $declaration
        ) {
            $parts =
                explode(
                    ':',
                    $declaration,
                    2
                );

            if (
                count($parts) !== 2
            ) {
                continue;
            }

            $property =
                strtolower(
                    trim($parts[0])
                );

            $value =
                trim($parts[1]
                );

            if (
                !in_array(
                    $property,
                    self::ALLOWED_STYLE_PROPS,
                    true
                )
            ) {
                continue;
            }

            if (
                preg_match(
                    '/url\s*\(|expression\s*\(|javascript:/i',
                    $value
                )
            ) {
                continue;
            }

            if (
                $property === 'text-align' &&
                !in_array(
                    strtolower($value),
                    [
                        'left',
                        'center',
                        'right',
                        'justify',
                    ],
                    true
                )
            ) {
                continue;
            }

            $safe[] =
                "{$property}: {$value}";
        }

        return implode(
            '; ',
            $safe
        );
    }
}