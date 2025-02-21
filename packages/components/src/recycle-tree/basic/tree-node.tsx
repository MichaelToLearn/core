import cls from 'classnames';
import React, { useCallback } from 'react';

import { isDefined } from '@opensumi/ide-utils';

import { Button } from '../../button';
import { Icon } from '../../icon';
import { Loading } from '../../loading';

import { BasicCompositeTreeNode, BasicTreeNode } from './tree-node.define';
import { IBasicInlineMenuPosition, IBasicNodeRendererProps, DECORATIONS } from './types';

import './styles.less';

export const BasicTreeNodeRenderer: React.FC<
  IBasicNodeRendererProps & { item: BasicCompositeTreeNode | BasicTreeNode }
> = ({
  item,
  className,
  itemHeight = 22,
  indent = 8,
  onClick,
  onDbClick,
  onTwistierClick,
  onContextMenu,
  decorations,
  inlineMenus = [],
  inlineMenuActuator = () => {},
}: IBasicNodeRendererProps & { item: BasicCompositeTreeNode | BasicTreeNode }) => {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (onClick) {
        event.stopPropagation();
        onClick(event, item as any);
      }
    },
    [onClick],
  );

  const handleDbClick = useCallback(
    (event: React.MouseEvent) => {
      if (onDbClick) {
        event.stopPropagation();
        onDbClick(event, item as any);
      }
    },
    [onDbClick],
  );

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (onContextMenu) {
        event.stopPropagation();
        event.preventDefault();
        onContextMenu(event, item as any);
      }
    },
    [onContextMenu],
  );

  const handlerTwistierClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      if (onTwistierClick) {
        onTwistierClick(event, item as any);
      } else if (onClick) {
        onClick(event, item as any);
      }
    },
    [onClick, onTwistierClick],
  );
  // 14 * 2 = Toggle Icon Size + Icon Size
  const paddingLeft = BasicCompositeTreeNode.is(item)
    ? `${(item.depth || 0) * (indent || 0)}px`
    : `${(item.depth || 0) * (indent || 0) + 14 * 2}px`;

  const treeNodeStyle = {
    height: itemHeight,
    lineHeight: `${itemHeight}px`,
    paddingLeft,
  } as React.CSSProperties;

  const renderIcon = useCallback(
    (node: BasicCompositeTreeNode | BasicTreeNode) =>
      node.iconClassName ? (
        // 图标的最大高度设置为 `itemHeight - 8`, 这样在视觉上看起来有一种 padding 的效果
        <Icon icon={node.icon} className={cls('icon', node.iconClassName)} style={{ maxHeight: itemHeight - 8 }} />
      ) : null,
    [],
  );

  const getName = useCallback(
    (node: BasicCompositeTreeNode | BasicTreeNode) => node.displayName.replace(/\n/g, '↵'),
    [],
  );

  const renderDisplayName = useCallback(
    (node: BasicCompositeTreeNode | BasicTreeNode) =>
      node.displayName && <div className={cls('segment', 'display_name')}>{getName(node)}</div>,
    [],
  );

  const renderDescription = useCallback((node: BasicCompositeTreeNode | BasicTreeNode) => {
    if (!node.description) {
      return null;
    }

    if (typeof node.description === 'string') {
      return <div className={cls('segment_grow', 'description')}>{node.description}</div>;
    }

    return node.description;
  }, []);

  const inlineMenuActions = useCallback(
    (item: BasicCompositeTreeNode | BasicTreeNode) => {
      if (Array.isArray(inlineMenus)) {
        return inlineMenus;
      } else if (typeof inlineMenus === 'function') {
        return inlineMenus(item);
      }
    },
    [inlineMenus],
  );

  const renderNodeTail = () => {
    const isBasicCompositeTreeNode = BasicCompositeTreeNode.is(item);
    const actions = inlineMenuActions(item)?.filter((menu) =>
      isBasicCompositeTreeNode
        ? menu.position === IBasicInlineMenuPosition.TREE_CONTAINER
        : menu.position === IBasicInlineMenuPosition.TREE_NODE,
    );
    if (!actions?.length) {
      return null;
    }
    const handleActionClick = useCallback((event: React.MouseEvent, action) => {
      event.stopPropagation();
      inlineMenuActuator(item, action);
    }, []);
    return (
      <div className={cls('segment', 'tail')}>
        {actions.map((action) => (
          <Button
            style={{ marginRight: '5px' }}
            type='icon'
            key={`${item.id}-${action.icon}`}
            icon={action.icon}
            title={action.title}
            onClick={(e) => handleActionClick(e, action)}
          />
        ))}
      </div>
    );
  };

  const renderFolderToggle = (node: BasicCompositeTreeNode, clickHandler: any) => {
    if (decorations && decorations?.classlist.indexOf(DECORATIONS.LOADING) > -1) {
      return <Loading />;
    }
    return (
      <Icon
        className={cls('segment', 'expansion_toggle', {
          ['mod_collapsed']: !(node as BasicCompositeTreeNode).expanded,
        })}
        onClick={clickHandler}
        icon='arrow-right'
      />
    );
  };

  const renderTwice = (item: BasicCompositeTreeNode | BasicTreeNode) => {
    if (isDefined((item as BasicCompositeTreeNode).expandable)) {
      if (!(item as BasicCompositeTreeNode).expandable) {
        return <div className={cls('segment', 'expansion_toggle')}></div>;
      }
    } else {
      return null;
    }

    if (BasicCompositeTreeNode.is(item)) {
      return renderFolderToggle(item as BasicCompositeTreeNode, handlerTwistierClick);
    }
  };

  return (
    <div
      key={item.id}
      onClick={handleClick}
      onDoubleClick={handleDbClick}
      onContextMenu={handleContextMenu}
      className={cls('tree_node', className, decorations ? decorations.classlist : null)}
      style={treeNodeStyle}
      data-id={item.id}
    >
      <div className='content'>
        {renderTwice(item)}
        {renderIcon(item)}
        <div className={'overflow_wrap'}>
          {renderDisplayName(item)}
          {renderDescription(item)}
        </div>
        {renderNodeTail()}
      </div>
    </div>
  );
};
